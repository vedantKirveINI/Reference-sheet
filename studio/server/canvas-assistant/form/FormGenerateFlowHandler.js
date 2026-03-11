/**
 * Form Generate Flow Handler
 * Handles flow generation for Form canvas (WORKFLOW_CANVAS mode)
 * Extends BaseGenerateFlowHandler with form-specific logic
 */

import { Agent } from "../core/Agent.js";
import OpenAI from "openai";
import toolRegistry from "../tools/ToolRegistry.js";
import { ContextBuilder } from "../context/ContextBuilder.js";
import { ModelSelector } from "../core/ModelSelector.js";
import promptManager from "../prompts/PromptManager.js";
import { ValidationError, createRequestId, logWithContext } from "../utils/errors.js";
import { FORM_CANVAS_MODE } from "../common/canvas-constants.js";
import { isTriggerNode, isNodeAllowedOnFormCanvas, validateFormNodeOrder } from "./form-rules.js";
import * as dbStudio from "../../db-studio.js";
import { validateFlowStructure } from "../common/connection-rules.js";
import { normalizeNodeTypeString } from "../common/node-type-normalizer.js";
import generateFlowFormPrompt from "./prompts/generate-flow-form.js";

const TOOL_FRIENDLY_NAMES = {
  searchExternalExtensions: "Searching integrations",
  searchAllExtensions: "Searching all extensions",
  getExtensionKnowledge: "Loading integration details",
  getUserConnections: "Checking your connections",
};

export class FormGenerateFlowHandler {
  constructor() {
    this.agent = new Agent();
    this.contextBuilder = new ContextBuilder();
    this.modelSelector = new ModelSelector();
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.agent.initialize();
      await promptManager.initialize();
      this.initialized = true;
    }
  }

  _emitSSE(res, event, data) {
    res.write(`data: ${JSON.stringify({ event, ...data })}\n\n`);
    if (typeof res.flush === "function") res.flush();
  }

  /**
   * Validate generated nodes for Form canvas
   * @param {Array} nodes - Generated nodes
   * @param {string} canvasType - Canvas type
   * @returns {object} - { valid: boolean, errors: Array<string> }
   */
  validateGeneratedNodes(nodes, canvasType) {
    const errors = [];
    
    if (!nodes || !Array.isArray(nodes)) {
      return { valid: false, errors: ["Nodes must be an array"] };
    }
    
    // Check for trigger nodes (forbidden on Form canvas)
    const triggerNodes = nodes.filter((node) => isTriggerNode(node.type));
    if (triggerNodes.length > 0) {
      errors.push(`Trigger nodes are not allowed on Form canvas. Found: ${triggerNodes.map((n) => n.type).join(", ")}`);
    }
    
    // Check if all nodes are allowed on Form canvas
    nodes.forEach((node) => {
      if (!isNodeAllowedOnFormCanvas(node.type)) {
        // Check if it's an integration node (allowed)
        if (!node.type || !node.type.startsWith("external/")) {
          errors.push(`Node type "${node.type}" is not allowed on Form canvas`);
        }
      }
    });

    // Positional rules: WELCOME only first, ENDING only last
    const orderValidation = validateFormNodeOrder(nodes);
    if (!orderValidation.valid) {
      errors.push(...orderValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async handleStream(req, res) {
    const requestId = createRequestId();

    try {
      await this.initialize();

      const {
        description,
        workflowContext,
        userId,
        accessToken,
        workspaceId,
        assetId,
        hasClarificationAnswers,
        canvasType,
        intent,
      } = req.body;

      if (!description || typeof description !== "string") {
        throw new ValidationError("Description is required");
      }

      // Ensure canvas type is Form canvas
      if (canvasType && canvasType !== FORM_CANVAS_MODE) {
        throw new ValidationError(`FormGenerateFlowHandler only handles Form canvas (${FORM_CANVAS_MODE}), got ${canvasType}`);
      }

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      });
      if (typeof res.flushHeaders === "function") res.flushHeaders();

      this._emitSSE(res, "thinking", { text: "Understanding your form request..." });

      const enrichedContext = await this.contextBuilder.build({
        workflowContext,
        userContext: { userId, accessToken, workspaceId, assetId },
      });

      // Form canvas has no triggers, so skip trigger detection
      // Forms are started by user interaction, not triggers

      this._emitSSE(res, "thinking", { text: "Analyzing form requirements..." });

      const insertOnly = intent?.insertOnly === true;
      const promptVariables = insertOnly
        ? { mode: "insert_only", operation: intent?.operation ?? "append", targetHint: intent?.targetHint ?? null }
        : {};
      const generateFlowPrompt = generateFlowFormPrompt(promptVariables);
      const prompt = `${generateFlowPrompt}\n\n**User Request:**\n${description}`;
      const modelConfig = this.modelSelector.getModel("workflowGeneration");
      const tools = toolRegistry.getOpenAISchemas();

      const messages = [
        { role: "system", content: prompt },
        { role: "user", content: description },
      ];

      let maxIterations = 5;
      let iteration = 0;
      let finalResult = null;

      while (iteration < maxIterations) {
        const isFinalIteration = iteration === maxIterations - 1;

        const apiParams = {
          model: modelConfig.model,
          messages,
          max_tokens: modelConfig.maxTokens,
          temperature: modelConfig.temperature,
        };

        if (isFinalIteration) {
          apiParams.response_format = { type: "json_object" };
        } else if (tools.length > 0) {
          apiParams.tools = tools;
          apiParams.tool_choice = "auto";
        }

        const response = await this.openai.chat.completions.create(apiParams);
        const choice = response.choices[0];
        const message = choice.message;

        if (!isFinalIteration && message.tool_calls && message.tool_calls.length > 0) {
          messages.push({
            role: "assistant",
            content: message.content || null,
            tool_calls: message.tool_calls,
          });

          for (const toolCall of message.tool_calls) {
            const toolName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments || "{}");

            const friendlyName = TOOL_FRIENDLY_NAMES[toolName] || `Running ${toolName}`;
            const queryHint = args.query ? ` for "${args.query}"` : "";
            this._emitSSE(res, "thinking", { text: `${friendlyName}${queryHint}...` });

            try {
              const result = await toolRegistry.execute(toolName, args, {
                userId, accessToken, workspaceId,
                workflowContext: enrichedContext.workflow,
              });

              const matchCount = Array.isArray(result) ? result.length : null;
              if (matchCount !== null) {
                this._emitSSE(res, "thinking", {
                  text: `Found ${matchCount} match${matchCount !== 1 ? "es" : ""}${queryHint}`,
                });
              }

              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              });
            } catch (error) {
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ error: error.message }),
              });
            }
          }

          iteration++;
          this._emitSSE(res, "thinking", { text: "Building form structure..." });
          continue;
        }

        const content = message.content || "{}";
        try {
          finalResult = JSON.parse(content);

          if (finalResult.needs_clarification && Array.isArray(finalResult.clarification_questions) && finalResult.clarification_questions.length > 0) {
            this._emitSSE(res, "result", {
              needsClarification: true,
              clarificationQuestions: finalResult.clarification_questions,
              nodes: [],
            });
            res.write(`data: [DONE]\n\n`);
            return res.end();
          }
          break;
        } catch (error) {
          if (!isFinalIteration) {
            iteration++;
            continue;
          }
          this._emitSSE(res, "result", {
            nodes: [],
            error: "Failed to parse form flow response",
          });
          res.write(`data: [DONE]\n\n`);
          return res.end();
        }
      }

      if (!finalResult) {
        this._emitSSE(res, "result", {
          nodes: [],
          error: "Failed to generate form flow after maximum iterations",
        });
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }

      this._emitSSE(res, "thinking", { text: "Validating form nodes..." });

      // Validate nodes for Form canvas
      const validation = this.validateGeneratedNodes(finalResult.nodes || [], canvasType);
      if (!validation.valid) {
        logWithContext("warn", "Form flow validation failed", requestId, { errors: validation.errors });
        // Continue anyway but log the errors
      }

      // Validate flow structure (single-journey rule)
      const nodes = finalResult.nodes || [];
      const links = []; // Links will be created by frontend, but we can validate node structure
      const structureValidation = validateFlowStructure(nodes, links);
      if (!structureValidation.valid && structureValidation.errors.length > 0) {
        logWithContext("warn", "Form flow structure validation warnings", requestId, { errors: structureValidation.errors });
      }

      const rawResult = { nodes, reasoning: finalResult.reasoning || null };
      const validatedResult = await this._validateAndTransformNodes(rawResult, requestId);

      if (validatedResult.needsClarification && validatedResult.clarificationQuestions?.length > 0) {
        this._emitSSE(res, "result", {
          needsClarification: true,
          clarificationQuestions: validatedResult.clarificationQuestions,
          nodes: [],
        });
      } else {
        this._emitSSE(res, "result", {
          nodes: validatedResult.nodes,
          reasoning: validatedResult.reasoning,
          needsClarification: false,
          clarificationQuestions: [],
        });
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      logWithContext("error", "Form generate flow stream error", requestId, { error: error.message });
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/event-stream" });
      }
      this._emitSSE(res, "error", { message: error.message || "Failed to generate form flow" });
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }

  async _validateAndTransformNodes(result, requestId) {
    const formQuestionTypes = new Set([
      "SHORT_TEXT", "LONG_TEXT", "MCQ", "SCQ", "PHONE_NUMBER", "ZIP_CODE",
      "DROP_DOWN", "DROP_DOWN_STATIC", "YES_NO", "RANKING", "EMAIL",
      "AUTHORIZATION", "QUESTION_FX", "WELCOME", "QUOTE", "ENDING",
      "DATE", "CURRENCY", "KEY_VALUE_TABLE", "NUMBER", "FILE_PICKER",
      "TIME", "SIGNATURE", "LOADING", "ADDRESS", "PDF_VIEWER",
      "TEXT_PREVIEW", "AUTOCOMPLETE", "CLOUD_FILE_EXPLORER",
      "MULTI_QUESTION_PAGE", "QUESTIONS_GRID", "PICTURE",
      "QUESTION_REPEATER", "COLLECT_PAYMENT", "RATING", "SLIDER",
      "OPINION_SCALE", "TERMS_OF_USE", "STRIPE_PAYMENT",
    ]);

    const sharedTypes = new Set([
      "HTTP", "TRANSFORMER_V3", "IFELSE_V2", "LOG", "JUMP_TO",
    ]);

    const INTEGRATION_TYPE = "Integration";
    const allNodes = result.nodes || [];
    const validNodes = [];
    const unresolvedExternalIdentifiers = [];

    for (const node of allNodes) {
      const rawType = node.type;
      if (!rawType) continue;

      const type = normalizeNodeTypeString(rawType, { canvasType: FORM_CANVAS_MODE });
      if (!type) continue;

      if (isTriggerNode(type)) {
        logWithContext("warn", "Filtered out trigger node from form flow", requestId, { nodeType: type });
        continue;
      }

      if (rawType.startsWith("external/")) {
        let knowledge = null;
        try {
          knowledge = await dbStudio.getIntegrationKnowledgeV2ByNodeIdentifier(rawType);
        } catch {
          // ignore
        }
        if (knowledge && knowledge.eventId) {
          let iconUrl = null;
          try {
            const raw = knowledge.rawIntegrationJson;
            if (raw) iconUrl = raw.thumbnail || raw.icon || raw.logo || raw.iconUrl || null;
          } catch {
            // ignore
          }
          const out = {
            type: INTEGRATION_TYPE,
            id: knowledge.eventId,
            integration_id: knowledge.integrationId || null,
            name: (node.name || knowledge.title || rawType).substring(0, 40),
            description: (node.description || knowledge.enrichedDescription || knowledge.description || "").substring(0, 200),
            config: node.config || {},
            workflowNodeIdentifier: rawType,
          };
          if (iconUrl) out.iconUrl = iconUrl;
          validNodes.push(out);
        } else {
          unresolvedExternalIdentifiers.push(rawType);
        }
        continue;
      }

      if (
        formQuestionTypes.has(type) ||
        sharedTypes.has(type) ||
        type === INTEGRATION_TYPE
      ) {
        const out = {
          type,
          name: (node.name || node.type).substring(0, 40),
          description: (node.description || "").substring(0, 200),
          config: node.config || {},
          go_data: node.go_data,
        };
        if (node.branch != null) out.branch = node.branch;
        validNodes.push(out);
      }
    }

    if (unresolvedExternalIdentifiers.length > 0) {
      const hint = unresolvedExternalIdentifiers[0];
      return {
        nodes: [],
        reasoning: result.reasoning,
        needsClarification: true,
        clarificationQuestions: [
          `I couldn't find an integration for "${hint}". Which app would you like to use? You can try being more specific (e.g. "Slack", "Gmail", "SendGrid").`,
        ],
      };
    }

    return {
      nodes: validNodes,
      reasoning: result.reasoning,
    };
  }

  /**
   * Non-streaming JSON handler for POST /generate-flow.
   * Mirrors handleStream logic but responds with application/json.
   */
  async handle(req, res) {
    const requestId = createRequestId();

    try {
      await this.initialize();

      const {
        description,
        workflowContext,
        userId,
        accessToken,
        workspaceId,
        assetId,
        hasClarificationAnswers,
        canvasType,
        intent,
      } = req.body;

      if (!description || typeof description !== "string") {
        throw new ValidationError("Description is required");
      }

      if (canvasType && canvasType !== FORM_CANVAS_MODE) {
        throw new ValidationError(`FormGenerateFlowHandler only handles Form canvas (${FORM_CANVAS_MODE}), got ${canvasType}`);
      }

      const enrichedContext = await this.contextBuilder.build({
        workflowContext,
        userContext: { userId, accessToken, workspaceId, assetId },
      });

      const insertOnly = intent?.insertOnly === true;
      const promptVariables = insertOnly
        ? { mode: "insert_only", operation: intent?.operation ?? "append", targetHint: intent?.targetHint ?? null }
        : {};
      const generateFlowPrompt = generateFlowFormPrompt(promptVariables);
      const prompt = `${generateFlowPrompt}\n\n**User Request:**\n${description}`;
      const modelConfig = this.modelSelector.getModel("workflowGeneration");
      const tools = toolRegistry.getOpenAISchemas();

      const messages = [
        { role: "system", content: prompt },
        { role: "user", content: description },
      ];

      let maxIterations = 5;
      let iteration = 0;
      let finalResult = null;

      while (iteration < maxIterations) {
        const isFinalIteration = iteration === maxIterations - 1;

        const apiParams = {
          model: modelConfig.model,
          messages,
          max_tokens: modelConfig.maxTokens,
          temperature: modelConfig.temperature,
        };

        if (isFinalIteration) {
          apiParams.response_format = { type: "json_object" };
        } else if (tools.length > 0) {
          apiParams.tools = tools;
          apiParams.tool_choice = "auto";
        }

        const response = await this.openai.chat.completions.create(apiParams);
        const choice = response.choices[0];
        const message = choice.message;

        if (!isFinalIteration && message.tool_calls && message.tool_calls.length > 0) {
          messages.push({
            role: "assistant",
            content: message.content || null,
            tool_calls: message.tool_calls,
          });

          for (const toolCall of message.tool_calls) {
            const toolName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments || "{}");

            try {
              const result = await toolRegistry.execute(toolName, args, {
                userId,
                accessToken,
                workspaceId,
                workflowContext: enrichedContext.workflow,
              });
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              });
            } catch (error) {
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

        const content = message.content || "{}";
        try {
          finalResult = JSON.parse(content);

          if (finalResult.needs_clarification && Array.isArray(finalResult.clarification_questions) && finalResult.clarification_questions.length > 0) {
            return res.status(200).json({
              needsClarification: true,
              clarificationQuestions: finalResult.clarification_questions,
              nodes: [],
              reasoning: finalResult.reasoning || null,
            });
          }
          break;
        } catch (error) {
          if (!isFinalIteration) {
            iteration++;
            continue;
          }
          return res.status(200).json({
            nodes: [],
            reasoning: null,
            needsClarification: false,
            clarificationQuestions: [],
            error: "Failed to parse form flow response",
          });
        }
      }

      if (!finalResult) {
        return res.status(200).json({
          nodes: [],
          reasoning: null,
          needsClarification: false,
          clarificationQuestions: [],
          error: "Failed to generate form flow after maximum iterations",
        });
      }

      this.validateGeneratedNodes(finalResult.nodes || [], canvasType);

      const rawResult = { nodes: finalResult.nodes || [], reasoning: finalResult.reasoning || null };
      const validatedResult = await this._validateAndTransformNodes(rawResult, requestId);

      if (validatedResult.needsClarification && validatedResult.clarificationQuestions?.length > 0) {
        return res.status(200).json({
          needsClarification: true,
          clarificationQuestions: validatedResult.clarificationQuestions,
          nodes: [],
          reasoning: validatedResult.reasoning || null,
        });
      }

      return res.status(200).json({
        nodes: validatedResult.nodes,
        reasoning: validatedResult.reasoning,
        needsClarification: false,
        clarificationQuestions: [],
      });
    } catch (error) {
      logWithContext("error", "Form generate flow (JSON) error", requestId, { error: error.message });
      if (error instanceof ValidationError) {
        return res.status(400).json(error.toJSON ? error.toJSON() : { error: error.message, nodes: [] });
      }
      if (!res.headersSent) {
        return res.status(500).json({
          nodes: [],
          error: error.message || "Failed to generate form flow",
          needsClarification: false,
          clarificationQuestions: [],
        });
      }
    }
  }
}
