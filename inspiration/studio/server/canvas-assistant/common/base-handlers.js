/**
 * Base handler classes that can be extended by canvas-specific handlers
 * Provides common functionality for node setup and flow generation
 */

import OpenAI from "openai";
import promptManager from "../prompts/PromptManager.js";
import { ModelSelector } from "../core/ModelSelector.js";
import { getNodeTypeConfig } from "./type-config-resolver.js";
import { ValidationError, createRequestId, logWithContext } from "../utils/errors.js";

/**
 * Base class for node setup handlers
 * Can be extended by form/workflow/sequence handlers
 */
export class BaseNodeSetupHandler {
  constructor() {
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    this.modelSelector = new ModelSelector();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await promptManager.initialize();
      this.initialized = true;
    }
  }

  /**
   * Get node type config (can be overridden by subclasses)
   * @param {string} nodeType - Node type
   * @param {string|null} canvasType - Canvas type
   * @returns {object} - Node type config
   */
  getNodeTypeConfig(nodeType, canvasType = null) {
    return getNodeTypeConfig(nodeType, canvasType);
  }

  /**
   * Validate node type is allowed for this canvas (can be overridden by subclasses)
   * @param {string} nodeType - Node type
   * @param {string} canvasType - Canvas type
   * @returns {object} - { valid: boolean, error?: string }
   */
  validateNodeType(nodeType, canvasType) {
    // Base implementation - always valid
    // Subclasses should override to add canvas-specific validation
    return { valid: true };
  }

  /**
   * Build system prompt for node setup (can be overridden by subclasses)
   * @param {string} nodeType - Node type
   * @param {string|null} canvasType - Canvas type
   * @returns {string} - System prompt
   */
  buildSystemPrompt(nodeType, canvasType = null) {
    const typeConfig = this.getNodeTypeConfig(nodeType, canvasType);
    
    let prompt = `You are a workflow configuration assistant for internal (built-in) nodes. Given the node type, the data available at that node (from previous steps), and the workflow goal, fill in the node's configuration.

Node type: ${nodeType}

Config schema for this type (return ONLY these keys in your JSON):
- ${typeConfig.configSchema}

Instructions:
- ${typeConfig.instructions}
- Use {{StepName.field}} syntax when referencing previous step output.`;

    if (typeConfig.customPromptFragment) {
      prompt += `\n\nAdditional: ${typeConfig.customPromptFragment}`;
    }

    prompt += `

Output format (choose one):
1. If you have enough information: return a JSON object with a "config" key containing the config keys for this node type. Example: { "config": { "url": "...", "method": "GET" } }
2. If critical information is missing (e.g. URL, connection, required field, or user intent) and you must not guess: return { "needs_clarification": true, "questions": [ { "id": "q1", "question": "What is the API URL?", "options": [] } ], "partialConfig": {} }. Use short, clear questions; options array is optional for multiple choice.
Do not invent required values. When in doubt, ask. Return ONLY valid JSON, no markdown.`;

    return prompt;
  }

  /**
   * Handle node setup request (can be overridden by subclasses)
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  async handle(req, res) {
    const requestId = createRequestId();

    try {
      await this.initialize();

      const {
        nodeType,
        nodeKey,
        currentConfig,
        dataAtNode,
        macroJourney,
        conversationSnippet,
        clarificationAnswers,
        canvasType,
      } = req.body || {};

      if (!nodeType || typeof nodeType !== "string") {
        throw new ValidationError("nodeType is required");
      }

      // Validate node type for canvas (subclasses can override)
      if (canvasType) {
        const validation = this.validateNodeType(nodeType, canvasType);
        if (!validation.valid) {
          return res.status(400).json({
            config: {},
            connectionHints: [],
            message: validation.error || "Node type not allowed for this canvas type.",
          });
        }
      }

      if (!this.openai) {
        return res.json({
          config: {},
          connectionHints: [],
          message: "AI service not configured.",
        });
      }

      const systemPrompt = this.buildSystemPrompt(nodeType, canvasType);
      const userContent = this.buildUserContent(
        nodeType,
        dataAtNode,
        macroJourney,
        conversationSnippet,
        currentConfig,
        clarificationAnswers
      );

      const modelConfig = this.modelSelector.getModel("setup");

      const response = await this.openai.chat.completions.create({
        model: modelConfig.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        max_tokens: modelConfig.maxTokens,
        response_format: { type: "json_object" },
      });

      const raw = response.choices?.[0]?.message?.content || "{}";
      let parsed = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {};
      }

      if (parsed.needs_clarification && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        logWithContext("info", "Node setup: clarification requested", requestId, {
          nodeType,
          canvasType,
          questionCount: parsed.questions.length,
        });
        return res.json({
          needs_clarification: true,
          questions: parsed.questions,
          partialConfig: parsed.partialConfig || {},
          message: parsed.message || "Please provide the following information.",
        });
      }

      const config = parsed.config != null ? parsed.config : parsed;
      logWithContext("info", "Node config generated", requestId, {
        nodeType,
        canvasType,
        configKeys: Object.keys(config).length,
      });

      res.json({
        config,
        connectionHints: [],
        message: "Configuration suggested. Review and save.",
      });
    } catch (error) {
      logWithContext("error", "Node setup handler error", requestId, {
        error: error.message,
        nodeType: req.body?.nodeType,
        canvasType: req.body?.canvasType,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      });

      if (error instanceof ValidationError) {
        return res.status(400).json(error.toJSON());
      }

      res.status(500).json({
        config: {},
        connectionHints: [],
        message: error.message || "Failed to generate config.",
      });
    }
  }

  /**
   * Build user content for the prompt
   * @param {string} nodeType - Node type
   * @param {object} dataAtNode - Data available at node
   * @param {string} macroJourney - Workflow goal
   * @param {string} conversationSnippet - Conversation context
   * @param {object} currentConfig - Current config
   * @param {object} clarificationAnswers - Clarification answers
   * @returns {string} - User content
   */
  buildUserContent(nodeType, dataAtNode, macroJourney, conversationSnippet, currentConfig, clarificationAnswers) {
    const data = typeof dataAtNode === "string" ? dataAtNode : JSON.stringify(dataAtNode ?? {});
    const goal = macroJourney || "Complete the workflow step.";
    let userContent = `Node type: ${nodeType}
Current config (optional): ${currentConfig ? JSON.stringify(currentConfig) : "{}"}
Data available at this node: ${data}
Workflow goal: ${goal}`;
    
    if (conversationSnippet) {
      userContent += `\nRecent context: ${conversationSnippet}`;
    }
    
    if (clarificationAnswers && Object.keys(clarificationAnswers).length > 0) {
      userContent += `\nUser provided answers: ${JSON.stringify(clarificationAnswers)}`;
    }
    
    userContent += "\n\nReturn a JSON object with only the config keys for this node type, filled using the data and goal.";
    return userContent;
  }
}

/**
 * Base class for flow generation handlers
 * Can be extended by form/workflow/sequence handlers
 */
export class BaseGenerateFlowHandler {
  constructor() {
    this.agent = null;
    this.contextBuilder = null;
    this.modelSelector = new ModelSelector();
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      // Subclasses should initialize agent and contextBuilder
      await promptManager.initialize();
      this.initialized = true;
    }
  }

  /**
   * Get prompt template name (can be overridden by subclasses)
   * @param {string} canvasType - Canvas type
   * @returns {string} - Prompt template name
   */
  getPromptTemplateName(canvasType) {
    return "generate-flow"; // Default to workflow prompt
  }

  /**
   * Validate generated nodes for canvas (can be overridden by subclasses)
   * @param {Array} nodes - Generated nodes
   * @param {string} canvasType - Canvas type
   * @returns {object} - { valid: boolean, errors: Array<string> }
   */
  validateGeneratedNodes(nodes, canvasType) {
    // Base implementation - always valid
    // Subclasses should override to add canvas-specific validation
    return { valid: true, errors: [] };
  }

  /**
   * Emit SSE event (helper method)
   * @param {object} res - Express response
   * @param {string} event - Event name
   * @param {object} data - Event data
   */
  _emitSSE(res, event, data) {
    res.write(`data: ${JSON.stringify({ event, ...data })}\n\n`);
    if (typeof res.flush === "function") res.flush();
  }
}
