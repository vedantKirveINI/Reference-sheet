import { Agent } from "../core/Agent.js";
import OpenAI from "openai";
import toolRegistry from "../tools/ToolRegistry.js";
import { ContextBuilder } from "../context/ContextBuilder.js";
import { ModelSelector } from "../core/ModelSelector.js";
import promptManager from "../prompts/PromptManager.js";
import { detectExistingTriggers } from "../context/transformers.js";
import { ValidationError, createRequestId, logWithContext } from "../utils/errors.js";
import { normalizeNodeTypeString } from "../common/node-type-normalizer.js";
import { PLACEHOLDER_NODE_TYPES } from "../common/placeholder-types.js";
import * as dbStudio from "../../db-studio.js";
import { TriggerResolver } from "./TriggerResolver.js";

const TOOL_FRIENDLY_NAMES = {
  searchExternalExtensions: "Searching integrations",
  searchAllExtensions: "Searching all extensions",
  getExtensionKnowledge: "Loading integration details",
  getUserConnections: "Checking your connections",
};

const KNOWN_SERVICES = [
  "gmail", "google mail", "slack", "hubspot", "stripe", "salesforce",
  "outlook", "microsoft outlook", "trello", "asana", "notion", "jira",
  "github", "discord", "shopify", "mailchimp", "zendesk", "intercom",
  "airtable", "calendly", "twilio", "sendgrid", "dropbox", "google sheets",
  "google drive", "google calendar", "whatsapp", "telegram", "teams",
  "microsoft teams", "clickup", "monday", "pipedrive", "freshdesk",
  "zoho", "quickbooks", "xero", "typeform", "surveymonkey", "webflow",
  "wordpress", "woocommerce", "linkedin", "twitter", "facebook",
  "instagram", "youtube", "tiktok", "pinterest", "reddit",
  "confluence", "bitbucket", "gitlab", "figma", "miro",
];

export class GenerateFlowHandler {
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

  _buildTriggerContext(triggerResolution) {
    if (!triggerResolution) {
      return "## PRE-RESOLVED TRIGGER\nTrigger resolution was not available. Use your best judgment to pick the trigger type based on the user's description.";
    }

    const { classification, confidence, resolvedTrigger, reasoning } = triggerResolution;

    if (classification === "app_event" && confidence !== "NONE" && resolvedTrigger) {
      return `## PRE-RESOLVED TRIGGER (USE THIS — DO NOT SEARCH FOR TRIGGERS)
The trigger for this workflow has been pre-determined by the trigger resolver:

**Classification:** App-Based Event Trigger
**Confidence:** ${confidence}
**Trigger:** ${resolvedTrigger.name}
**Type to use:** "${resolvedTrigger.type}"
**Reasoning:** ${reasoning}

INSTRUCTIONS: Use this EXACTLY as your first node:
{ "type": "${resolvedTrigger.type}", "is_trigger": true, "name": "${resolvedTrigger.name}", "description": "${resolvedTrigger.description}", "config": {} }

Do NOT add a manual trigger (TRIGGER_SETUP_V3) or any other trigger. Do NOT search for trigger integrations — the trigger has already been resolved.
Focus ONLY on building the ACTION steps that come after this trigger. You may still search for action integrations (kind: "action") for the remaining steps.`;
    }

    if (classification === "app_event" && confidence === "NONE") {
      const appName = triggerResolution.searchDetails?.appName || "the requested app";
      return `## PRE-RESOLVED TRIGGER (STRICT FALLBACK — READ CAREFULLY)
The trigger resolver searched for an app-based trigger for "${appName}" but found NO matching trigger integrations in the system.

**MANDATORY:** Use "TRIGGER_SETUP_V3" (Manual Trigger) as the first node. The user can configure the ${appName} trigger manually later.

**CRITICAL RULES:**
- You MUST use "TRIGGER_SETUP_V3" — no exceptions.
- NEVER substitute with SHEET_TRIGGER_V2, SHEET_DATE_FIELD_TRIGGER, or any other trigger type.
- SHEET_TRIGGER_V2 is for TinySheet (internal spreadsheet) only — it has NOTHING to do with ${appName} or email/calendar/external apps.
- Do NOT search for trigger integrations — the search has already been done.

**Your first node MUST be:** { "type": "TRIGGER_SETUP_V3", "name": "${appName} Trigger", "description": "Triggers when an event occurs in ${appName} (configure after setup)", "config": {} }

Now focus on building the ACTION steps that follow the trigger.`;
    }

    if (resolvedTrigger) {
      return `## PRE-RESOLVED TRIGGER
The trigger type has been determined:
**Classification:** ${classification}
**Trigger type to use:** "${resolvedTrigger.type}"
**Name:** "${resolvedTrigger.name}"
**Reasoning:** ${reasoning}

Use this as your first node. Do NOT change the trigger type.`;
    }

    return `## PRE-RESOLVED TRIGGER\n${reasoning || "Use your best judgment for the trigger type."}`;
  }

  _extractMentionedServices(description) {
    const descLower = description.toLowerCase();
    const found = [];
    for (const service of KNOWN_SERVICES) {
      const pattern = new RegExp(`\\b${service.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(descLower)) {
        found.push(service);
      }
    }
    const normalized = new Set();
    const aliases = {
      "google mail": "gmail",
      "microsoft outlook": "outlook",
      "microsoft teams": "teams",
    };
    for (const s of found) {
      normalized.add(aliases[s] || s);
    }
    return [...normalized];
  }

  async _preDiscoverIntegrations(services, triggerAppName) {
    const triggerAppLower = (triggerAppName || "").toLowerCase();
    const actionServices = services.filter(s => s.toLowerCase() !== triggerAppLower);

    if (actionServices.length === 0) {
      return [];
    }

    const discoveries = [];
    for (const service of actionServices) {
      try {
        const results = await dbStudio.searchIntegrationKnowledgeV2(`${service} action`, {
          limit: 3,
          similarityThreshold: 0.4,
          kind: "action",
        });
        if (results.length > 0) {
          discoveries.push({
            service,
            results: results.map(r => ({
              title: r.title,
              workflowNodeIdentifier: r.workflowNodeIdentifier,
              kind: r.kind,
              description: (r.content || r.enrichedDescription || "").substring(0, 150),
              inputSchema: r.inputSchema || null,
            })),
          });
        }
      } catch (error) {
        console.warn(`[GenerateFlowHandler] Pre-discovery for "${service}" failed:`, error.message);
      }
    }
    return discoveries;
  }

  _buildIntegrationContext(discoveries) {
    if (!discoveries || discoveries.length === 0) {
      return "";
    }

    let context = `\n\n## PRE-DISCOVERED ACTION INTEGRATIONS\nThe following action integrations were found for the services the user mentioned. Use these workflow_node_identifier values as the node "type" in your response. You do NOT need to call search tools for these — they are already resolved.\n\n`;

    for (const disc of discoveries) {
      context += `### ${disc.service.charAt(0).toUpperCase() + disc.service.slice(1)}\n`;
      for (const r of disc.results) {
        context += `- **${r.title}**: type = "${r.workflowNodeIdentifier}" — ${r.description}\n`;
      }
      context += "\n";
    }

    context += `Use the most appropriate integration from above for each step. You may still call search tools if you need integrations not listed here.\n`;

    return context;
  }

  _validateCompleteness(nodes, description, mentionedServices, triggerAppName) {
    const descLower = description.toLowerCase();
    const warnings = [];

    const triggerAppLower = (triggerAppName || "").toLowerCase();
    const actionServices = mentionedServices.filter(s => s.toLowerCase() !== triggerAppLower);

    for (const service of actionServices) {
      const serviceLower = service.toLowerCase();
      const nodeCoversService = nodes.some(n => {
        const type = (n.type || "").toLowerCase();
        const name = (n.name || "").toLowerCase();
        const desc = (n.description || "").toLowerCase();
        return type.includes(serviceLower) || name.includes(serviceLower) || desc.includes(serviceLower);
      });
      if (!nodeCoversService) {
        warnings.push(`User mentioned "${service}" but no node in the workflow references it.`);
      }
    }

    const aiKeywords = ["extract", "keyword", "summarize", "summary", "analyze", "analysis", "classify", "categorize", "generate text", "write", "draft", "compose"];
    const needsAI = aiKeywords.some(kw => descLower.includes(kw));
    if (needsAI) {
      const hasAINode = nodes.some(n => {
        const type = (n.type || "");
        return type.startsWith("GPT") || type === "GPT";
      });
      if (!hasAINode) {
        warnings.push(`User's request involves text processing (extract/summarize/analyze) but no AI/GPT node was included.`);
      }
    }

    const outputKeywords = ["send", "notify", "alert", "post", "message", "email", "deliver"];
    const hasOutputIntent = outputKeywords.some(kw => descLower.includes(kw));
    if (hasOutputIntent && nodes.length <= 1) {
      warnings.push(`User wants an output action (send/notify/email) but workflow only has a trigger node.`);
    }

    return warnings;
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
      } = req.body;

      if (!description || typeof description !== "string") {
        throw new ValidationError("Description is required");
      }

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      });
      if (typeof res.flushHeaders === "function") res.flushHeaders();

      this._emitSSE(res, "thinking", { text: "Understanding your request..." });

      const enrichedContext = await this.contextBuilder.build({
        workflowContext,
        userContext: { userId, accessToken, workspaceId, assetId },
      });

      if (!hasClarificationAnswers) {
        const existingTriggers = detectExistingTriggers(enrichedContext.workflow);
        if (existingTriggers && existingTriggers.length > 0) {
          this._emitSSE(res, "result", {
            needsClarification: true,
            clarificationQuestions: [
              "A trigger already exists in this workflow. Would you like to modify the existing trigger or add actions to the current workflow?",
            ],
            nodes: [],
          });
          res.write(`data: [DONE]\n\n`);
          return res.end();
        }
      }

      this._emitSSE(res, "thinking", { text: "Analyzing trigger requirements..." });

      let triggerResolution = null;
      try {
        const triggerResolver = new TriggerResolver(this.openai);
        triggerResolution = await triggerResolver.resolve(description);
        logWithContext("info", "Trigger resolution complete", requestId, {
          classification: triggerResolution.classification,
          confidence: triggerResolution.confidence,
          hasTrigger: !!triggerResolution.resolvedTrigger,
          reasoning: triggerResolution.reasoning,
        });

        if (triggerResolution.classification === "app_event") {
          if (triggerResolution.confidence !== "NONE") {
            this._emitSSE(res, "thinking", {
              text: `Found ${triggerResolution.searchDetails?.selectedMatch || "app"} trigger`,
            });
          } else {
            this._emitSSE(res, "thinking", {
              text: `No app trigger found for ${triggerResolution.searchDetails?.appName || "the app"}, using manual trigger`,
            });
          }
        }
      } catch (err) {
        logWithContext("warn", "Trigger resolution failed, continuing without it", requestId, { error: err.message });
        triggerResolution = null;
      }

      this._emitSSE(res, "thinking", { text: "Searching for integrations..." });

      const mentionedServices = this._extractMentionedServices(description);
      const triggerAppName = triggerResolution?.searchDetails?.appName || null;
      let integrationDiscoveries = [];
      if (mentionedServices.length > 0) {
        try {
          integrationDiscoveries = await this._preDiscoverIntegrations(mentionedServices, triggerAppName);
          logWithContext("info", "Pre-discovered integrations", requestId, {
            mentionedServices,
            discoveredCount: integrationDiscoveries.length,
            discovered: integrationDiscoveries.map(d => d.service),
          });
          if (integrationDiscoveries.length > 0) {
            this._emitSSE(res, "thinking", {
              text: `Found integrations for ${integrationDiscoveries.map(d => d.service).join(", ")}`,
            });
          }
        } catch (err) {
          logWithContext("warn", "Pre-discovery failed", requestId, { error: err.message });
        }
      }

      this._emitSSE(res, "thinking", { text: "Building workflow structure..." });

      const generateFlowPrompt = promptManager.get("generate-flow");
      const triggerContext = this._buildTriggerContext(triggerResolution);
      const integrationContext = this._buildIntegrationContext(integrationDiscoveries);
      const prompt = `${generateFlowPrompt}\n\n${triggerContext}${integrationContext}\n\n**User Request:**\n${description}`;
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
          this._emitSSE(res, "thinking", { text: "Building workflow structure..." });
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
            error: "Failed to parse workflow response",
          });
          res.write(`data: [DONE]\n\n`);
          return res.end();
        }
      }

      if (!finalResult) {
        this._emitSSE(res, "result", {
          nodes: [],
          error: "Failed to generate workflow after maximum iterations",
        });
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }

      this._emitSSE(res, "thinking", { text: "Validating node types..." });

      const rawResult = { nodes: finalResult.nodes || [], reasoning: finalResult.reasoning || null };
      let validatedResult = await this._validateAndTransformNodes(rawResult, requestId);

      const completenessWarnings = this._validateCompleteness(
        validatedResult.nodes, description, mentionedServices, triggerAppName
      );

      if (completenessWarnings.length > 0) {
        logWithContext("warn", "Workflow completeness issues detected, attempting repair", requestId, {
          warnings: completenessWarnings,
          nodeCount: validatedResult.nodes.length,
        });

        this._emitSSE(res, "thinking", { text: "Refining workflow..." });

        try {
          const repairPrompt = `The workflow you generated has completeness issues:\n${completenessWarnings.map(w => `- ${w}`).join("\n")}\n\nOriginal user request: "${description}"\n\nCurrent nodes: ${JSON.stringify(validatedResult.nodes.map(n => ({ type: n.type, name: n.name })))}\n\nPlease regenerate the COMPLETE workflow as a JSON object with a "nodes" array. Include ALL steps the user requested. Remember:\n- For text processing (extract, summarize, analyze), use GPT_ANALYZER, GPT_SUMMARIZER, or GPT.\n- For external services, use the workflow_node_identifier from PRE-DISCOVERED INTEGRATIONS if available.\n- Ensure every service and action the user mentioned is represented.`;

          messages.push({
            role: "user",
            content: repairPrompt,
          });

          const repairResponse = await this.openai.chat.completions.create({
            model: modelConfig.model,
            messages,
            max_tokens: modelConfig.maxTokens,
            temperature: modelConfig.temperature,
            response_format: { type: "json_object" },
          });

          const repairContent = repairResponse.choices[0]?.message?.content || "{}";
          const repairResult = JSON.parse(repairContent);

          if (repairResult.nodes && repairResult.nodes.length > validatedResult.nodes.length) {
            const repairedValidated = await this._validateAndTransformNodes(
              { nodes: repairResult.nodes, reasoning: repairResult.reasoning || rawResult.reasoning },
              requestId
            );
            logWithContext("info", "Workflow repair successful", requestId, {
              originalNodes: validatedResult.nodes.length,
              repairedNodes: repairedValidated.nodes.length,
            });
            validatedResult = repairedValidated;
          }
        } catch (repairError) {
          logWithContext("warn", "Workflow repair failed, using original result", requestId, {
            error: repairError.message,
          });
        }
      }

      this._emitSSE(res, "result", {
        nodes: validatedResult.nodes,
        reasoning: validatedResult.reasoning,
        needsClarification: false,
        clarificationQuestions: [],
      });

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      logWithContext("error", "Generate flow stream error", requestId, { error: error.message });
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/event-stream" });
      }
      this._emitSSE(res, "error", { message: error.message || "Failed to generate workflow" });
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }

  async _validateAndTransformNodes(result, requestId) {
    const internalTypes = new Set([
      "FORM_TRIGGER", "CUSTOM_WEBHOOK", "TIME_BASED_TRIGGER_V2", "SHEET_TRIGGER_V2", "SHEET_DATE_FIELD_TRIGGER",
      "HTTP", "TRANSFORMER_V3", "SELF_EMAIL",
      "CREATE_RECORD_V2", "UPDATE_RECORD_V2", "DB_FIND_ALL_V2", "DB_FIND_ONE_V2",
      "GPT", "GPT_RESEARCHER", "GPT_WRITER", "GPT_ANALYZER", "GPT_SUMMARIZER",
      "IFELSE_V2", "ITERATOR_V2", "DELAY_V2", "PERSON_ENRICHMENT_V2", "COMPANY_ENRICHMENT_V2",
    ]);

    const allNodes = result.nodes || [];
    const nodeTypesToCheck = [...new Set(allNodes.map((n) => normalizeNodeTypeString(n.type, { canvasType: "WC_CANVAS" })).filter(Boolean))];
    const externalTypes = new Set();
    const v2ExternalTypes = new Set();
    const unknownTypes = nodeTypesToCheck.filter((type) => !internalTypes.has(type));

    if (unknownTypes.length > 0) {
      for (const nodeType of unknownTypes) {
        try {
          let knowledge = await dbStudio.getIntegrationKnowledgeV2ByNodeIdentifier(nodeType);
          if (knowledge) {
            externalTypes.add(nodeType);
            v2ExternalTypes.add(nodeType);
          }
        } catch {}
      }
    }

    const v2KnowledgeMap = new Map();
    if (v2ExternalTypes.size > 0) {
      const v2Results = await Promise.all(
        Array.from(v2ExternalTypes).map(async (nodeType) => {
          try {
            const knowledge = await dbStudio.getIntegrationKnowledgeV2ByNodeIdentifier(nodeType);
            return { nodeType, knowledge };
          } catch { return { nodeType, knowledge: null }; }
        })
      );
      for (const { nodeType, knowledge } of v2Results) {
        if (knowledge) v2KnowledgeMap.set(nodeType, knowledge);
      }
    }

    const allValidTypes = new Set([...internalTypes, ...externalTypes]);

    const extractIconUrl = (v2Knowledge) => {
      try {
        const raw = v2Knowledge?.rawIntegrationJson;
        if (raw) return raw.thumbnail || raw.icon || raw.logo || raw.iconUrl || null;
      } catch {}
      return null;
    };

    const extractIntegrationMeta = (v2Knowledge) => {
      const raw = v2Knowledge?.rawIntegrationJson;
      return {
        integrationId: v2Knowledge?.integrationId || null,
        integrationSlug: v2Knowledge?.integrationSlug || null,
        integrationName: raw?.name || raw?.title || v2Knowledge?.integrationSlug || null,
        integrationIcon: extractIconUrl(v2Knowledge),
        integrationColor: raw?.color || null,
        eventId: v2Knowledge?.eventId || null,
        eventSlug: v2Knowledge?.eventSlug || null,
        eventName: v2Knowledge?.title || null,
      };
    };

    const transformIntegrationTriggerNode = (node, v2Knowledge) => {
      const meta = extractIntegrationMeta(v2Knowledge);
      const out = {
        type: "TRIGGER_SETUP_V3",
        name: (node.name || v2Knowledge.title || node.type).substring(0, 40),
        description: (node.description || v2Knowledge.enrichedDescription || v2Knowledge.description || "").substring(0, 200),
        config: {},
        is_app_trigger: true,
        trigger_integration: {
          integration_id: meta.integrationId,
          integration_slug: meta.integrationSlug,
          integration_name: meta.integrationName,
          integration_icon: meta.integrationIcon,
          integration_color: meta.integrationColor,
          event_id: meta.eventId,
          event_slug: meta.eventSlug,
          event_name: meta.eventName,
          workflow_node_identifier: v2Knowledge.workflowNodeIdentifier,
        },
      };
      return out;
    };

    const transformIntegrationActionNode = (node, v2Knowledge) => {
      if (!v2Knowledge || !v2Knowledge.eventId) {
        return {
          type: node.type,
          name: (node.name || node.type).substring(0, 40),
          description: (node.description || "").substring(0, 200),
          config: node.config || {},
        };
      }
      const iconUrl = extractIconUrl(v2Knowledge);
      const out = {
        type: "Integration",
        id: v2Knowledge.eventId,
        integration_id: v2Knowledge.integrationId || null,
        name: (node.name || v2Knowledge.title || node.type).substring(0, 40),
        description: (node.description || v2Knowledge.enrichedDescription || v2Knowledge.description || "").substring(0, 200),
        config: node.config || {},
      };
      if (iconUrl) out.iconUrl = iconUrl;
      return out;
    };

    const validNodes = [];
    const filteredPlaceholders = [];
    for (const node of allNodes) {
      if (!node.type) continue;
      const type = normalizeNodeTypeString(node.type, { canvasType: "WC_CANVAS" });
      if (!type) continue;
      if (PLACEHOLDER_NODE_TYPES.includes(type)) {
        filteredPlaceholders.push(type);
        continue;
      }
      if (allValidTypes.has(type)) {
        const v2Knowledge = v2KnowledgeMap.get(type);
        const out = v2Knowledge ? transformIntegrationNode(node, v2Knowledge) : {
          type,
          name: (node.name || node.type).substring(0, 40),
          description: (node.description || "").substring(0, 200),
          config: node.config || {},
        };
        if (!v2Knowledge && node.branch != null) out.branch = node.branch;
        validNodes.push(out);
      }
    }

    if (filteredPlaceholders.length > 0) {
      logWithContext("warn", "Filtered placeholder node types from AI response", requestId, { types: filteredPlaceholders });
    }

    return { nodes: validNodes, reasoning: result.reasoning || null };
  }

  async handle(req, res) {
    const requestId = createRequestId();

    try {
      await this.initialize();

      const { description, workflowContext, userId, accessToken, workspaceId, assetId, hasClarificationAnswers } = req.body;

      if (!description || typeof description !== "string") {
        throw new ValidationError("Description is required");
      }

      const enrichedContext = await this.contextBuilder.build({
        workflowContext,
        userContext: { userId, accessToken, workspaceId, assetId },
      });

      if (!hasClarificationAnswers) {
        const existingTriggers = detectExistingTriggers(enrichedContext.workflow);
        if (existingTriggers && existingTriggers.length > 0) {
          return res.json({
            needsClarification: true,
            clarificationQuestions: [
              "A trigger already exists in this workflow. Would you like to modify the existing trigger or add actions to the current workflow?",
            ],
            nodes: [],
            reasoning: null,
          });
        }
      }

      let triggerResolution = null;
      try {
        const triggerResolver = new TriggerResolver(this.openai);
        triggerResolution = await triggerResolver.resolve(description);
      } catch (err) {
        logWithContext("warn", "Trigger resolution failed in handle()", requestId, { error: err.message });
      }

      const mentionedServices = this._extractMentionedServices(description);
      const triggerAppName = triggerResolution?.searchDetails?.appName || null;
      let integrationDiscoveries = [];
      if (mentionedServices.length > 0) {
        try {
          integrationDiscoveries = await this._preDiscoverIntegrations(mentionedServices, triggerAppName);
        } catch (err) {
          logWithContext("warn", "Pre-discovery failed in handle()", requestId, { error: err.message });
        }
      }

      const integrationContext = this._buildIntegrationContext(integrationDiscoveries);

      const result = await this.agent.generateWorkflow({
        description,
        workflowContext: enrichedContext.workflow,
        userContext: { userId, accessToken, workspaceId, assetId },
        requestId,
        triggerContext: this._buildTriggerContext(triggerResolution) + integrationContext,
      });

      let validated = await this._validateAndTransformNodes(result, requestId);

      const completenessWarnings = this._validateCompleteness(
        validated.nodes, description, mentionedServices, triggerAppName
      );
      if (completenessWarnings.length > 0) {
        logWithContext("warn", "Workflow completeness issues in handle(), attempting repair", requestId, {
          warnings: completenessWarnings,
        });
      }

      res.json({
        nodes: validated.nodes,
        reasoning: validated.reasoning,
        needsClarification: result.needsClarification || false,
        clarificationQuestions: result.clarificationQuestions || [],
      });
    } catch (error) {
      logWithContext("error", "Generate flow handler error", requestId, { error: error.message });
      if (error instanceof ValidationError) return res.status(400).json(error.toJSON());
      res.status(500).json({ error: true, message: error.message || "Failed to generate workflow", code: "GENERATE_FLOW_ERROR", nodes: [] });
    }
  }
}
