import OpenAI from "openai";
import promptManager from "../prompts/PromptManager.js";
import { ModelSelector } from "../core/ModelSelector.js";
import { ValidationError, createRequestId, logWithContext } from "../utils/errors.js";
import * as dbStudio from "../../db-studio.js";

/**
 * IntegrationNodeSetupHandler - Handles setup for Integration (extension) nodes.
 * Context: connections, channels, events; uses GetExtensionKnowledge / integration_knowledge_v2 when available.
 */
export class IntegrationNodeSetupHandler {
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

      logWithContext("info", "Integration node setup request received", requestId, {
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
        eventId,
        template,
        connectionsList,
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

      const flow = currentConfig?.flow || {};
      const identifier = eventId || template || flow?.eventId || flow?.workflowNodeIdentifier;
      let extensionKnowledge = null;
      if (identifier) {
        try {
          extensionKnowledge = await dbStudio.getIntegrationKnowledgeV2ByNodeIdentifier(identifier);
        } catch (err) {
          logWithContext("info", "Integration knowledge not found for identifier", requestId, {
            identifier,
            error: err.message,
          });
        }
      }

      const systemPrompt = promptManager.get("setup-integration");
      const data = typeof dataAtNode === "string" ? dataAtNode : JSON.stringify(dataAtNode ?? {});
      const goal = macroJourney || "Complete the workflow step.";
      let userContent = `Node type: ${nodeType}
Current flow (optional): ${JSON.stringify(flow)}
Data available at this node: ${data}
Workflow goal: ${goal}`;
      if (conversationSnippet) {
        userContent += `\nRecent context: ${conversationSnippet}`;
      }
      if (connectionsList && connectionsList.length > 0) {
        userContent += `\nUser's connected integrations: ${JSON.stringify(connectionsList)}`;
      }
      if (extensionKnowledge) {
        userContent += `\nEvent/action knowledge: title=${extensionKnowledge.title || ""}; description=${extensionKnowledge.enrichedDescription || extensionKnowledge.description || ""}; config keys: ${extensionKnowledge.configKeySummary || "see schema"}`;
      }
      if (clarificationAnswers && Object.keys(clarificationAnswers).length > 0) {
        userContent += `\nUser provided answers: ${JSON.stringify(clarificationAnswers)}`;
      }
      userContent += "\n\nReturn a JSON object: either { \"config\": { \"flow\": { ... } } } or { \"needs_clarification\": true, \"questions\": [ ... ] }.";

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
        logWithContext("info", "Integration node setup: clarification requested", requestId, {
          questionCount: parsed.questions.length,
        });
        return res.json({
          needs_clarification: true,
          questions: parsed.questions,
          partialConfig: parsed.partialConfig || {},
          message: parsed.message || "Please provide the following information.",
        });
      }

      const config = parsed.config || {};
      const flowOutput = config.flow != null ? config.flow : config;
      const mergedConfig = Object.keys(flowOutput).length > 0 ? { flow: flowOutput } : {};

      logWithContext("info", "Integration node config generated", requestId, {
        configKeys: Object.keys(mergedConfig).length,
      });

      res.json({
        config: mergedConfig,
        connectionHints: [],
        message: "Configuration suggested. Review and save.",
      });
    } catch (error) {
      logWithContext("error", "Integration node setup error", requestId, {
        error: error.message,
        nodeType: req.body?.nodeType,
      });

      if (error instanceof ValidationError) {
        return res.status(400).json(error.toJSON());
      }

      res.status(500).json({
        config: {},
        connectionHints: [],
        message: error.message || "Integration setup failed.",
      });
    }
  }
}
