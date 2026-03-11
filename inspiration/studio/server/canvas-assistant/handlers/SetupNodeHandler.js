import OpenAI from "openai";
import promptManager from "../prompts/PromptManager.js";
import { composeSetupNodePrompt } from "../prompts/composers.js";
import { ModelSelector } from "../core/ModelSelector.js";
import { ValidationError, createRequestId, logWithContext } from "../utils/errors.js";

/**
 * SetupNodeHandler - Handles /api/canvas-assistant/setup-node endpoint.
 * @deprecated For internal nodes, the router delegates to InternalNodeSetupHandler (per-type prompts).
 * For integration nodes, the router delegates to IntegrationNodeSetupHandler.
 * This handler and the setup-node prompt are no longer invoked by the setup-node route; kept for backward compatibility.
 */
export class SetupNodeHandler {
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

      logWithContext("info", "Setup node request received", requestId, {
        nodeType: req.body?.nodeType,
      });

      const {
        nodeType,
        nodeKey,
        currentConfig,
        dataAtNode,
        macroJourney,
        conversationSnippet,
      } = req.body || {};

      // Validation
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

      const data = dataAtNode != null
        ? typeof dataAtNode === "string"
          ? dataAtNode
          : JSON.stringify(dataAtNode)
        : "{}";
      const goal = macroJourney || "Complete the workflow step.";
      const snippet = conversationSnippet || "";

      // Compose prompt
      const prompt = composeSetupNodePrompt(nodeType, data, goal, snippet);

      // Get model config
      const modelConfig = this.modelSelector.getModel("setup");

      // Call OpenAI
      const response = await this.openai.chat.completions.create({
        model: modelConfig.model,
        messages: [
          { role: "system", content: promptManager.get("setup-node") },
          {
            role: "user",
            content: `Node type: ${nodeType}\nCurrent config (optional): ${currentConfig ? JSON.stringify(currentConfig) : "{}"}\nData available at this node: ${data}\nWorkflow goal: ${goal}\n${snippet ? `Recent context: ${snippet}` : ""}\n\nReturn a JSON object with only the config keys for this node type, filled using the data and goal.`,
          },
        ],
        max_tokens: modelConfig.maxTokens,
        response_format: { type: "json_object" },
      });

      const raw = response.choices?.[0]?.message?.content || "{}";
      let config = {};
      try {
        config = JSON.parse(raw);
      } catch {
        config = {};
      }

      logWithContext("info", "Node config generated", requestId, {
        nodeType,
        configKeys: Object.keys(config).length,
      });

      res.json({
        config,
        connectionHints: [],
        message: "Configuration suggested. Review and save.",
      });
    } catch (error) {
      logWithContext("error", "Setup node handler error", requestId, {
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
