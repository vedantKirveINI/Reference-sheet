import OpenAI from "openai";
import promptManager from "../prompts/PromptManager.js";
import { composeInternalSetupNodePrompt } from "../prompts/composers.js";
import { ModelSelector } from "../core/ModelSelector.js";
import { ValidationError, createRequestId, logWithContext } from "../utils/errors.js";

/**
 * InternalNodeSetupHandler - Handles setup for internal (non-Integration) node types.
 * Uses per-type schema and instructions from setup-internal-types; builds prompt from setup-internal template.
 */
export class InternalNodeSetupHandler {
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

  async handle(req, res) {
    const requestId = createRequestId();

    try {
      await this.initialize();

      logWithContext("info", "Internal node setup request received", requestId, {
        nodeType: req.body?.nodeType,
      });

      const {
        nodeType,
        nodeKey,
        currentConfig,
        dataAtNode,
        macroJourney,
        conversationSnippet,
        clarificationAnswers,
      } = req.body || {};

      if (!nodeType || typeof nodeType !== "string") {
        throw new ValidationError("nodeType is required");
      }

      if (!this.openai) {
        return res.json({
          config: {},
          connectionHints: [],
          message: "AI service not configured.",
        });
      }

      const { systemPrompt, userContent } = composeInternalSetupNodePrompt(
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
        logWithContext("info", "Internal node setup: clarification requested", requestId, {
          nodeType,
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
      logWithContext("info", "Internal node config generated", requestId, {
        nodeType,
        configKeys: Object.keys(config).length,
      });

      res.json({
        config,
        connectionHints: [],
        message: "Configuration suggested. Review and save.",
      });
    } catch (error) {
      logWithContext("error", "Internal node setup handler error", requestId, {
        error: error.message,
        nodeType: req.body?.nodeType,
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
}
