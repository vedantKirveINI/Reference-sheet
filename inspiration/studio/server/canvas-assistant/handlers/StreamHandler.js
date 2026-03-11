import OpenAI from "openai";
import toolRegistry from "../tools/ToolRegistry.js";
import { ContextBuilder } from "../context/ContextBuilder.js";
import { composeSystemPrompt, buildSpecialModePrompt } from "../prompts/composers.js";
import promptManager from "../prompts/PromptManager.js";
import { ConversationMemory } from "../memory/ConversationMemory.js";
import { ModelSelector } from "../core/ModelSelector.js";
import { ValidationError, createRequestId, logWithContext } from "../utils/errors.js";

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;

/**
 * StreamHandler - Handles /api/canvas-assistant/stream endpoint
 */
export class StreamHandler {
  constructor() {
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    this.contextBuilder = new ContextBuilder();
    this.conversationMemory = new ConversationMemory();
    this.modelSelector = new ModelSelector();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await toolRegistry.initialize();
      await promptManager.initialize();
      this.initialized = true;
    }
  }

  async handle(req, res) {
    const requestId = createRequestId();
    
    try {
      await this.initialize();

      logWithContext("info", "Stream request received", requestId, {
        path: req.path,
        method: req.method,
      });

      const { messages, workflowContext, mode, conversationId, userId, accessToken, workspaceId, assetId, canvasType } = req.body;
      const effectiveCanvasType = canvasType ?? workflowContext?.canvasType ?? null;

      // Validation
      if (!messages || !Array.isArray(messages)) {
        throw new ValidationError("Messages array is required");
      }

      if (messages.length > MAX_MESSAGES) {
        throw new ValidationError(`Too many messages (max ${MAX_MESSAGES})`);
      }

      const validRoles = new Set(["system", "user", "assistant"]);
      for (const msg of messages) {
        if (!msg.role || !validRoles.has(msg.role)) {
          throw new ValidationError(`Invalid message role: ${msg.role}`);
        }
        if (typeof msg.content !== "string" || msg.content.length > MAX_MESSAGE_LENGTH) {
          throw new ValidationError(`Message content too long (max ${MAX_MESSAGE_LENGTH} chars)`);
        }
      }

      if (!this.openai) {
        return res.json({
          message: "I'm not fully set up yet — the AI service needs an API key to be configured.",
        });
      }

      // Build enriched context
      const enrichedContext = await this.contextBuilder.build({
        workflowContext,
        userContext: { userId, accessToken, workspaceId, assetId },
        memoryContext: { conversationId },
      });

      // Get conversation history
      const recentMessages = conversationId
        ? await this.conversationMemory.getRecentMessages(conversationId, 10)
        : [];

      // Build system prompt
      const contextBlock = this.contextBuilder.buildContextBlock(enrichedContext);
      const modePrompt = buildSpecialModePrompt(mode, enrichedContext.workflow);
      const systemPrompt = composeSystemPrompt(contextBlock, modePrompt, mode, effectiveCanvasType);

      // Prepare messages
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...recentMessages,
        ...messages.filter((m) => m.role !== "system"),
      ];

      // Get tools
      const tools = toolRegistry.getOpenAISchemas();

      // Get model config
      const modelConfig = this.modelSelector.getModel("conversation");

      // Set up streaming
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      });
      if (typeof res.flushHeaders === "function") res.flushHeaders();

      const TOOL_FRIENDLY = {
        searchExternalExtensions: "Searching integrations",
        searchAllExtensions: "Searching all extensions",
        getExtensionKnowledge: "Loading integration details",
        getUserConnections: "Checking your connections",
      };

      let maxIterations = 5;
      let iteration = 0;
      let finalResponse = "";

      while (iteration < maxIterations) {
        const stream = await this.openai.chat.completions.create({
          model: modelConfig.model,
          messages: apiMessages,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? "auto" : undefined,
          max_completion_tokens: modelConfig.maxTokens,
          stream: true,
        });

        let hasToolCalls = false;
        let toolCalls = [];

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta;
          if (!delta) continue;

          if (delta.content) {
            res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
            if (typeof res.flush === "function") res.flush();
            finalResponse += delta.content;
          }

          if (delta.tool_calls) {
            hasToolCalls = true;
            for (const toolCallDelta of delta.tool_calls) {
              const index = toolCallDelta.index;
              if (!toolCalls[index]) {
                toolCalls[index] = {
                  id: toolCallDelta.id,
                  type: "function",
                  function: { name: "", arguments: "" },
                };
              }
              if (toolCallDelta.function?.name) {
                toolCalls[index].function.name += toolCallDelta.function.name;
              }
              if (toolCallDelta.function?.arguments) {
                toolCalls[index].function.arguments += toolCallDelta.function.arguments;
              }
            }
          }
        }

        if (hasToolCalls && toolCalls.length > 0) {
          for (const toolCall of toolCalls) {
            const toolName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments || "{}");

            const friendly = TOOL_FRIENDLY[toolName] || `Running ${toolName}`;
            const hint = args.query ? ` for "${args.query}"` : "";
            res.write(`data: ${JSON.stringify({ thinking: `${friendly}${hint}...` })}\n\n`);
            if (typeof res.flush === "function") res.flush();

            try {
              const result = await toolRegistry.execute(toolName, args, {
                userId,
                accessToken,
                workspaceId,
                workflowContext: enrichedContext.workflow,
              });

              apiMessages.push({
                role: "assistant",
                content: null,
                tool_calls: [toolCall],
              });

              apiMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              });
            } catch (error) {
              console.error(`[StreamHandler] Tool execution error:`, error);
              apiMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ error: error.message }),
              });
            }
          }

          iteration++;
          continue;
        }

        break;
      }

      // Save to memory if conversationId exists
      if (conversationId) {
        const userMessages = messages.filter(m => m.role === "user");
        const lastUserMessage = userMessages[userMessages.length - 1]?.content;
        if (lastUserMessage) {
          await this.conversationMemory.addMessage(conversationId, "user", lastUserMessage);
        }
        if (finalResponse) {
          await this.conversationMemory.addMessage(conversationId, "assistant", finalResponse);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();

      logWithContext("info", "Stream completed", requestId);
    } catch (error) {
      logWithContext("error", "Stream handler error", requestId, {
        error: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      });

      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/event-stream" });
      }
      res.write(`data: ${JSON.stringify({ error: error.message || "Internal server error" })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }
}
