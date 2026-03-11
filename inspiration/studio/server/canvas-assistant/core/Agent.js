import OpenAI from "openai";
import toolRegistry from "../tools/ToolRegistry.js";
import { ContextBuilder } from "../context/ContextBuilder.js";
import { ConversationMemory } from "../memory/ConversationMemory.js";
import { LongTermMemory } from "../memory/LongTermMemory.js";
import { ModelSelector } from "./ModelSelector.js";
import { AgentSession } from "./AgentSession.js";
import { composeSystemPrompt, buildSpecialModePrompt } from "../prompts/composers.js";
import promptManager from "../prompts/PromptManager.js";
import { logWithContext } from "../utils/errors.js";

/**
 * Agent - Main agent orchestrator
 * 
 * Manages tool calls, conversation state, context enrichment, memory management,
 * error handling & retries, and cost tracking.
 */
export class Agent {
  constructor() {
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    this.contextBuilder = new ContextBuilder();
    this.conversationMemory = new ConversationMemory();
    this.longTermMemory = new LongTermMemory();
    this.modelSelector = new ModelSelector();
    this.sessions = new Map();
  }

  /**
   * Initialize agent (load tools, prompts, etc.)
   */
  async initialize() {
    await toolRegistry.initialize();
    await promptManager.initialize();
    console.log("[Agent] Initialized");
  }

  /**
   * Get or create session
   * @param {string} conversationId - Conversation ID
   * @param {string} assetId - Asset ID (optional)
   * @param {string} userId - User ID (optional)
   * @returns {AgentSession} - Session instance
   */
  getSession(conversationId, assetId = null, userId = null) {
    if (!this.sessions.has(conversationId)) {
      const session = new AgentSession(conversationId, assetId, userId);
      this.sessions.set(conversationId, session);
    }
    return this.sessions.get(conversationId);
  }

  /**
   * Process a chat message
   * @param {object} options - Chat options
   * @param {string} options.conversationId - Conversation ID
   * @param {string} options.message - User message
   * @param {object} options.workflowContext - Workflow context
   * @param {object} options.userContext - User context
   * @param {string} options.mode - Special mode (optional)
   * @returns {Promise<object>} - Agent response
   */
  async chat(options) {
    const {
      conversationId,
      message,
      workflowContext,
      userContext,
      mode = null,
      canvasType = null,
    } = options;

    if (!this.openai) {
      return {
        message: "I'm not fully set up yet — the AI service needs an API key to be configured.",
        error: "OpenAI not configured",
      };
    }

    // Get or create session
    const session = this.getSession(conversationId, userContext?.assetId, userContext?.userId);

    // Build enriched context
    const enrichedContext = await this.contextBuilder.build({
      workflowContext,
      userContext,
      memoryContext: { conversationId },
    });

    // Get conversation history
    const recentMessages = await this.conversationMemory.getRecentMessages(conversationId, 10);
    
    // Build system prompt
    const contextBlock = this.contextBuilder.buildContextBlock(enrichedContext);
    const modePrompt = buildSpecialModePrompt(mode, enrichedContext.workflow);
    const systemPrompt = composeSystemPrompt(contextBlock, modePrompt, mode, canvasType);

    // Prepare messages
    const messages = [
      { role: "system", content: systemPrompt },
      ...recentMessages,
      { role: "user", content: message },
    ];

    // Get tools
    const tools = toolRegistry.getOpenAISchemas();

    // Get model config
    const modelConfig = this.modelSelector.getModel("conversation");

    // Call OpenAI
    let maxIterations = 5;
    let iteration = 0;
    let finalResponse = "";

    while (iteration < maxIterations) {
      const response = await this.openai.chat.completions.create({
        model: modelConfig.model,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
      });

      const choice = response.choices[0];
      const message = choice.message;

      // Handle tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Add assistant message with tool calls
        messages.push({
          role: "assistant",
          content: message.content || null,
          tool_calls: message.tool_calls,
        });

        // Execute tools
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || "{}");

          try {
            const result = await toolRegistry.execute(toolName, args, {
              ...userContext,
              workflowContext: enrichedContext.workflow,
            });

            // Record tool call
            session.addToolCall(toolName, args, result);

            // Add tool result to messages
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            });
          } catch (error) {
            console.error(`[Agent] Tool execution error:`, error);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: error.message }),
            });
          }
        }

        iteration++;
        continue;
      }

      // Final response
      finalResponse = message.content || "";
      break;
    }

    // Save messages to memory
    await this.conversationMemory.addMessage(conversationId, "user", message);
    await this.conversationMemory.addMessage(conversationId, "assistant", finalResponse);

    // Update session
    session.addMessage("user", message);
    session.addMessage("assistant", finalResponse);
    session.cacheContext(enrichedContext);

    return {
      message: finalResponse,
      sessionId: conversationId,
    };
  }

  /**
   * Generate workflow from description
   * @param {object} options - Generation options
   * @param {string} options.description - Workflow description
   * @param {object} options.workflowContext - Existing workflow context
   * @param {object} options.userContext - User context
   * @param {string} options.requestId - Request ID for logging (optional)
   * @returns {Promise<object>} - Generated workflow
   */
  async generateWorkflow(options) {
    const { description, workflowContext, userContext, requestId = null } = options;

    if (!this.openai) {
      return {
        nodes: [],
        error: "OpenAI not configured",
      };
    }

    // Build enriched context
    const enrichedContext = await this.contextBuilder.build({
      workflowContext,
      userContext,
    });

    // Check for existing triggers
    if (enrichedContext.existingTriggers && enrichedContext.existingTriggers.length > 0) {
      return {
        needsClarification: true,
        clarificationQuestions: [
          "A trigger already exists in this workflow. Would you like to modify the existing trigger or add actions to the current workflow?",
        ],
        nodes: [],
      };
    }

    // Compose prompt
    const generateFlowPrompt = promptManager.get("generate-flow");
    const prompt = `${generateFlowPrompt}

**User Request:**
${description}`;

    // Get model config
    const modelConfig = this.modelSelector.getModel("workflowGeneration");

    // Get tools for discovering external integrations
    const tools = toolRegistry.getOpenAISchemas();
    
    // Log available tools
    if (requestId) {
      logWithContext("info", "Workflow generation started", requestId, {
        description: description.substring(0, 200),
        availableToolsCount: tools.length,
        availableTools: tools.map(t => t.function?.name || "unknown"),
        model: modelConfig.model,
      });
    } else {
      console.log("[Agent.generateWorkflow] Available tools:", tools.map(t => t.function?.name || "unknown"));
    }

    // Prepare messages array
    const messages = [
      { role: "system", content: prompt },
      { role: "user", content: description },
    ];

    // Iterative tool call loop (similar to chat method)
    let maxIterations = 5;
    let iteration = 0;
    let finalResult = null;
    const toolCallHistory = [];

    while (iteration < maxIterations) {
      // Determine if this is the final iteration
      const isFinalIteration = iteration === maxIterations - 1;

      if (requestId) {
        logWithContext("info", "Workflow generation iteration", requestId, {
          iteration: iteration + 1,
          maxIterations,
          isFinalIteration,
          messagesCount: messages.length,
        });
      }

      // Build API call parameters
      const apiParams = {
        model: modelConfig.model,
        messages,
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
      };

      // On final iteration, enforce JSON format and prevent tool calls
      if (isFinalIteration) {
        apiParams.response_format = { type: "json_object" };
        // Don't set tool_choice when no tools are provided - OpenAI API requires tools to be present if tool_choice is set
        if (requestId) {
          logWithContext("info", "Final iteration - enforcing JSON format", requestId, {
            iteration: iteration + 1,
          });
        }
      } else if (tools.length > 0) {
        // During discovery phase, enable tool calls
        apiParams.tools = tools;
        apiParams.tool_choice = "auto";
      }

      // Call OpenAI
      const response = await this.openai.chat.completions.create(apiParams);

      const choice = response.choices[0];
      const message = choice.message;

      // Handle tool calls (only during discovery phase, not final iteration)
      if (!isFinalIteration && message.tool_calls && message.tool_calls.length > 0) {
        if (requestId) {
          logWithContext("info", "Tool calls detected", requestId, {
            iteration: iteration + 1,
            toolCallsCount: message.tool_calls.length,
            toolCalls: message.tool_calls.map(tc => ({
              id: tc.id,
              name: tc.function?.name,
              arguments: tc.function?.arguments,
            })),
          });
        }

        // Add assistant message with tool calls
        messages.push({
          role: "assistant",
          content: message.content || null,
          tool_calls: message.tool_calls,
        });

        // Execute tools
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || "{}");

          if (requestId) {
            logWithContext("info", "Executing tool", requestId, {
              toolName,
              args,
              iteration: iteration + 1,
            });
          }

          try {
            const result = await toolRegistry.execute(toolName, args, {
              ...userContext,
              workflowContext: enrichedContext.workflow,
            });

            // Log tool result (truncated for large results)
            const resultPreview = typeof result === 'string' 
              ? result.substring(0, 500) 
              : JSON.stringify(result).substring(0, 500);
            
            if (requestId) {
              logWithContext("info", "Tool execution completed", requestId, {
                toolName,
                resultPreview,
                resultType: Array.isArray(result) ? `array[${result.length}]` : typeof result,
              });
            }

            // Track tool call in history
            toolCallHistory.push({
              iteration: iteration + 1,
              toolName,
              args,
              resultType: Array.isArray(result) ? `array[${result.length}]` : typeof result,
              resultPreview,
            });

            // Add tool result to messages
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            });
          } catch (error) {
            const errorMsg = error.message || String(error);
            if (requestId) {
              logWithContext("error", "Tool execution error", requestId, {
                toolName,
                args,
                error: errorMsg,
                iteration: iteration + 1,
              });
            } else {
              console.error(`[Agent] Tool execution error in generateWorkflow:`, error);
            }
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: errorMsg }),
            });
          }
        }

        iteration++;
        continue;
      }

      // Final response (either from tool-free path or final iteration)
      const content = message.content || "{}";
      
      if (requestId) {
        logWithContext("info", "Received workflow response", requestId, {
          iteration: iteration + 1,
          isFinalIteration,
          contentLength: content.length,
          contentPreview: content.substring(0, 500),
          hasToolCalls: !!(message.tool_calls && message.tool_calls.length > 0),
        });
      }

      try {
        finalResult = JSON.parse(content);
        
        // Check for clarification request
        if (finalResult.needs_clarification && Array.isArray(finalResult.clarification_questions) && finalResult.clarification_questions.length > 0) {
          if (requestId) {
            logWithContext("info", "Workflow generation: clarification requested", requestId, {
              questionCount: finalResult.clarification_questions.length,
              questions: finalResult.clarification_questions,
            });
          }
          return {
            nodes: [],
            needsClarification: true,
            clarificationQuestions: finalResult.clarification_questions,
          };
        }
        
        if (requestId) {
          logWithContext("info", "Workflow JSON parsed successfully", requestId, {
            iteration: iteration + 1,
            nodesCount: finalResult.nodes?.length || 0,
            nodeTypes: finalResult.nodes?.map(n => n.type) || [],
            toolCallHistory,
          });
        }
        
        break;
      } catch (error) {
        // If JSON parsing fails and we're not on final iteration, continue
        if (!isFinalIteration) {
          if (requestId) {
            logWithContext("warn", "JSON parse failed, continuing to next iteration", requestId, {
              iteration: iteration + 1,
              error: error.message,
            });
          }
          iteration++;
          continue;
        }
        // If JSON parsing fails on final iteration, return error
        if (requestId) {
          logWithContext("error", "Failed to parse workflow JSON on final iteration", requestId, {
            error: error.message,
            contentPreview: content.substring(0, 500),
          });
        }
        return {
          nodes: [],
          error: "Failed to parse workflow response",
        };
      }
    }

    // If we exhausted iterations without a valid result
    if (!finalResult) {
      if (requestId) {
        logWithContext("error", "Exhausted iterations without valid result", requestId, {
          maxIterations,
          toolCallHistory,
        });
      }
      return {
        nodes: [],
        error: "Failed to generate workflow after maximum iterations",
      };
    }

    // Log final result
    if (requestId) {
      logWithContext("info", "Workflow generation completed", requestId, {
        nodesCount: finalResult.nodes?.length || 0,
        nodeTypes: finalResult.nodes?.map(n => n.type) || [],
        nodeDetails: finalResult.nodes?.map(n => ({
          type: n.type,
          name: n.name,
          description: n.description?.substring(0, 100),
        })) || [],
        toolCallHistory,
      });
    }

    return {
      nodes: finalResult.nodes || [],
      reasoning: finalResult.reasoning || null,
    };
  }
}
