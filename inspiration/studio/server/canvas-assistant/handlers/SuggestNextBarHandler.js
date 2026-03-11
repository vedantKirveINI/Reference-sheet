import OpenAI from "openai";
import { ContextBuilder } from "../context/ContextBuilder.js";
import { buildContextBlock } from "../context/transformers.js";
import { composeSuggestNextPrompt } from "../prompts/composers.js";
import { LongTermMemory } from "../memory/LongTermMemory.js";
import { ModelSelector } from "../core/ModelSelector.js";
import { SUGGEST_NEXT_BAR_TYPES } from "../utils/constants.js";
import promptManager from "../prompts/PromptManager.js";
import * as dbStudio from "../../db-studio.js";
import { createRequestId, logWithContext } from "../utils/errors.js";
import { FORM_CANVAS_MODE } from "../common/canvas-constants.js";
import { isTriggerNode, isNodeAllowedOnFormCanvas } from "../form/form-rules.js";
import { findLastNodeInChain } from "../common/connection-rules.js";

/**
 * SuggestNextBarHandler - Handles /api/canvas-assistant/suggest-next-bar endpoint
 */
export class SuggestNextBarHandler {
  constructor() {
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    this.contextBuilder = new ContextBuilder();
    this.longTermMemory = new LongTermMemory();
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

      logWithContext("info", "Suggest next bar request received", requestId);

      const { workflowContext, decisionHistory, conversationId, assetId, canvasType } = req.body;

      if (!this.openai) {
        return res.json({
          intentSummary: "",
          suggestedNodeTypes: [],
          inferredGoal: "",
          goalMet: false,
          suggestedConfig: {},
          connectionHints: [],
        });
      }

      // Build enriched context
      const enrichedContext = await this.contextBuilder.build({
        workflowContext,
        enrichers: ["workflow"],
      });

      const nodes = enrichedContext.workflow?.nodes || [];
      const links = enrichedContext.workflow?.links || [];
      
      // Get canvas type from request or workflow context
      const effectiveCanvasType = canvasType || workflowContext?.canvasType;
      const isFormCanvas = effectiveCanvasType === FORM_CANVAS_MODE;

      const nodeCount = nodes.length;
      // For Form canvas, skip trigger checks (forms have no triggers)
      const hasTrigger = !isFormCanvas && nodes.some(
        (n) => n.type && (n.type.includes("TRIGGER") || n.type.includes("WEBHOOK"))
      );
      const hasAction = nodes.some(
        (n) => n.type && !n.type.includes("TRIGGER") && !n.type.includes("WEBHOOK")
      );
      const hasLinks = links.length > 0;

      // For Form canvas, structural completeness doesn't require triggers
      const isStructurallyComplete = isFormCanvas 
        ? (hasAction && hasLinks) 
        : (hasTrigger && hasAction && hasLinks);
      const shouldIncludeGoalMet = isStructurallyComplete && nodeCount >= 4;
      
      // Filter node types based on canvas type
      const allowedNodeTypes = this.getAllowedNodeTypesForCanvas(effectiveCanvasType);

      // Skip AI for trivial workflows (0 nodes)
      if (nodeCount === 0) {
        return res.json({
          intentSummary: "",
          suggestedNodeTypes: [],
          inferredGoal: "",
          goalMet: false,
          suggestedConfig: {},
          connectionHints: [],
        });
      }

      // Get decision history from long-term memory if available
      let decisionHistoryText = decisionHistory || "";
      if (assetId && !decisionHistoryText) {
        const decisions = await this.longTermMemory.getDecisionMemory(assetId, 10);
        if (decisions.length > 0) {
          decisionHistoryText = decisions
            .map((d) => {
              const summary = d.suggestion_summary || "";
              const outcome = d.outcome || "";
              return `${outcome}: ${summary}`;
            })
            .join("\n");
        }
      }

      // For single trigger node, use basic prompt
      if (nodeCount === 1 && !isFormCanvas) {
        return await this.handleSingleNode(
          enrichedContext.workflow,
          decisionHistoryText,
          conversationId,
          effectiveCanvasType,
          allowedNodeTypes,
          res
        );
      }

      // For workflows with 2+ nodes, use enhanced prompt
      return await this.handleMultipleNodes(
        enrichedContext.workflow,
        decisionHistoryText,
        conversationId,
        shouldIncludeGoalMet,
        effectiveCanvasType,
        allowedNodeTypes,
        res
      );
    } catch (error) {
      logWithContext("error", "Suggest next bar handler error", requestId, {
        error: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      });

      res.status(500).json({
        intentSummary: "",
        suggestedNodeTypes: [],
        inferredGoal: "",
        goalMet: false,
        suggestedConfig: {},
        connectionHints: [],
      });
    }
  }

  /**
   * Get allowed node types for a canvas type
   * @param {string|null} canvasType - Canvas type
   * @returns {Array<string>} - Allowed node types
   */
  getAllowedNodeTypesForCanvas(canvasType) {
    const isFormCanvas = canvasType === FORM_CANVAS_MODE;
    
    if (isFormCanvas) {
      // Form canvas: filter out triggers and workflow-only nodes
      return SUGGEST_NEXT_BAR_TYPES.filter((type) => {
        return !isTriggerNode(type) && isNodeAllowedOnFormCanvas(type);
      });
    }
    
    // Workflow canvas: return all types (default behavior)
    return SUGGEST_NEXT_BAR_TYPES;
  }

  async handleSingleNode(workflowContext, decisionHistory, conversationId, canvasType, allowedNodeTypes, res) {
    const isFormCanvas = canvasType === FORM_CANVAS_MODE;
    const canvasContext = isFormCanvas 
      ? "Form canvas: Forms have no triggers. Suggest form question nodes or shared nodes (HTTP, TRANSFORMER_V3, IFELSE_V2, LOG, JUMP_TO)."
      : "Workflow canvas: Suggest workflow nodes including triggers if no trigger exists.";
    
    const basicPrompt = `Based on the user's current workflow context below, do two things:

1. Write a short 2-line plain-English summary of what you think they are trying to build (max 2 sentences, friendly tone).
2. Suggest exactly 2 next node types they would likely add. Use only the internal type IDs from this list: ${allowedNodeTypes.join(", ")}.

${canvasContext}

Return ONLY a JSON object with these exact keys:
- "intentSummary": string (your 2-line summary)
- "suggestedNodeTypes": array of exactly 2 strings (node type IDs from the list above)

Example: {"intentSummary":"You're building a lead capture flow that enriches contacts and routes to CRM or email.","suggestedNodeTypes":["IFELSE_V2","CREATE_RECORD_V2"]}`;

    const contextBlock = buildContextBlock(workflowContext);
    const decisionBlock = decisionHistory
      ? `\n\n[USER DECISION HISTORY]\n${decisionHistory}\n\nIMPORTANT: Do NOT re-suggest node types that the user has already declined or dismissed. Prioritize node types similar to what the user has manually added or accepted.`
      : "";
    const userContent = contextBlock
      ? `${basicPrompt}\n\n${contextBlock}${decisionBlock}`
      : "No workflow context provided.";

    const modelConfig = this.modelSelector.getModel("conversation");

    const response = await this.openai.chat.completions.create({
      model: modelConfig.model,
      messages: [
        { role: "system", content: "You are a workflow automation assistant. Return only valid JSON." },
        { role: "user", content: userContent },
      ],
      max_completion_tokens: 256,
      response_format: { type: "json_object" },
    });

    const content = response.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.json({
        intentSummary: "",
        suggestedNodeTypes: [],
        inferredGoal: "",
        goalMet: false,
        suggestedConfig: {},
        connectionHints: [],
      });
    }

    const validTypesSet = new Set(allowedNodeTypes);
    const suggestedNodeTypes = (parsed.suggestedNodeTypes || [])
      .filter((t) => typeof t === "string" && validTypesSet.has(t))
      .slice(0, 2);
    const suggestedConfig =
      parsed.suggestedConfig && typeof parsed.suggestedConfig === "object"
        ? parsed.suggestedConfig
        : {};
    const connectionHints = Array.isArray(parsed.connectionHints) ? parsed.connectionHints : [];
    const inferredGoal = typeof parsed.inferredGoal === "string" ? parsed.inferredGoal.trim() : "";

    if (conversationId && inferredGoal) {
      dbStudio.updateConversationMacroJourney(conversationId, inferredGoal).catch(() => {});
    }

    return res.json({
      intentSummary:
        typeof parsed.intentSummary === "string"
          ? parsed.intentSummary.trim().substring(0, 300)
          : "",
      suggestedNodeTypes,
      inferredGoal: "",
      goalMet: false,
      suggestedConfig,
      connectionHints,
    });
  }

  async handleMultipleNodes(
    workflowContext,
    decisionHistory,
    conversationId,
    shouldIncludeGoalMet,
    canvasType,
    allowedNodeTypes,
    res
  ) {
    const contextBlock = buildContextBlock(workflowContext);
    const promptToUse = composeSuggestNextPrompt(
      workflowContext,
      allowedNodeTypes,
      shouldIncludeGoalMet,
      canvasType
    );

    const decisionBlock = decisionHistory
      ? `\n\n[USER DECISION HISTORY]\n${decisionHistory}\n\nIMPORTANT: Do NOT re-suggest node types that the user has already declined or dismissed. Prioritize node types similar to what the user has manually added or accepted.`
      : "";
    const userContent = contextBlock
      ? `${promptToUse}\n\n${contextBlock}${decisionBlock}`
      : "No workflow context provided.";

    const modelConfig = this.modelSelector.getModel("conversation");

    const response = await this.openai.chat.completions.create({
      model: modelConfig.model,
      messages: [
        { role: "system", content: "You are a workflow automation assistant. Return only valid JSON." },
        { role: "user", content: userContent },
      ],
      max_completion_tokens: 256,
      response_format: { type: "json_object" },
    });

    const content = response.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.json({
        intentSummary: "",
        suggestedNodeTypes: [],
        inferredGoal: "",
        goalMet: false,
        suggestedConfig: {},
        connectionHints: [],
      });
    }

    const validTypesSet = new Set(allowedNodeTypes);
    const suggestedNodeTypes = (parsed.suggestedNodeTypes || [])
      .filter((t) => typeof t === "string" && validTypesSet.has(t))
      .slice(0, 2);
    const suggestedConfig =
      parsed.suggestedConfig && typeof parsed.suggestedConfig === "object"
        ? parsed.suggestedConfig
        : {};
    const connectionHints = Array.isArray(parsed.connectionHints) ? parsed.connectionHints : [];

    // If completeness check failed, don't include goalMet
    if (!shouldIncludeGoalMet) {
      const inferredGoal = typeof parsed.inferredGoal === "string" ? parsed.inferredGoal.trim() : "";
      if (conversationId && inferredGoal) {
        dbStudio.updateConversationMacroJourney(conversationId, inferredGoal).catch(() => {});
      }
      return res.json({
        intentSummary:
          typeof parsed.intentSummary === "string"
            ? parsed.intentSummary.trim().substring(0, 300)
            : "",
        suggestedNodeTypes,
        inferredGoal: "",
        goalMet: false,
        suggestedConfig,
        connectionHints,
      });
    }

    // Include goalMet and inferredGoal only if structurally complete with 4+ nodes
    const inferredGoal =
      typeof parsed.inferredGoal === "string" ? parsed.inferredGoal.trim().substring(0, 100) : "";
    if (conversationId && inferredGoal) {
      dbStudio.updateConversationMacroJourney(conversationId, inferredGoal).catch(() => {});
    }

    return res.json({
      intentSummary:
        typeof parsed.intentSummary === "string"
          ? parsed.intentSummary.trim().substring(0, 300)
          : "",
      suggestedNodeTypes: parsed.goalMet ? [] : suggestedNodeTypes,
      inferredGoal,
      goalMet: typeof parsed.goalMet === "boolean" ? parsed.goalMet : false,
      suggestedConfig,
      connectionHints,
    });
  }
}
