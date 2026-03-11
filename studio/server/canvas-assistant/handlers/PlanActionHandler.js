import OpenAI from "openai";
import { ContextBuilder } from "../context/ContextBuilder.js";
import { ModelSelector } from "../core/ModelSelector.js";
import { ACTION_PLAN_VERSION } from "../common/action-plan-schema.js";
import { normalizeNodeTypeString } from "../common/node-type-normalizer.js";
import { findLastNodeInChain } from "../common/connection-rules.js";

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeStr(x) {
  if (typeof x !== "string") return "";
  return x.trim();
}

function listNodeIndexHints(nodeIndex, limit = 8) {
  if (!Array.isArray(nodeIndex)) return [];
  const out = [];
  const seen = new Set();
  for (const n of nodeIndex) {
    const label = normalizeStr(n?.label);
    const type = normalizeStr(n?.subType || n?.type);
    const key = normalizeStr(n?.key);

    const hint = label || type || key;
    if (!hint) continue;

    const k = hint.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);

    out.push(hint);
    if (out.length >= limit) break;
  }
  return out;
}

function clarificationPlan({ canvasType, kind, nodeIndex, message }) {
  if (message) {
    return {
      version: ACTION_PLAN_VERSION,
      canvasType: canvasType ?? null,
      needsClarification: true,
      clarificationQuestions: [message],
      summary: null,
      steps: [],
    };
  }

  const hints = listNodeIndexHints(nodeIndex, 8);
  const hintText = hints.length ? ` I can see: ${hints.join(", ")}.` : "";

  return {
    version: ACTION_PLAN_VERSION,
    canvasType: canvasType ?? null,
    needsClarification: true,
    clarificationQuestions: [
      `Which node should I ${kind === "remove" ? "delete" : "update"}? Please reply with the exact node name/label.${hintText}`,
    ],
    summary: null,
    steps: [],
  };
}

function normalizeStepTarget(step) {
  const target = step?.target;

  // v1
  const by = normalizeStr(target?.by);
  const value = normalizeStr(target?.value);
  if (by && value) return { by, value };

  // legacy shape
  const legacyKey = normalizeStr(target?.key);
  if (legacyKey) return { by: "key", value: legacyKey };

  const legacyType = normalizeStr(target?.type);
  if (legacyType) return { by: "type", value: legacyType };

  if (value && !by) return { by: "label", value };

  return null;
}

function looksLikeActionPlan(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (Array.isArray(obj.steps)) return true;
  if (typeof obj.needsClarification === "boolean" && Array.isArray(obj.clarificationQuestions)) return true;
  return false;
}

function coerceToActionPlan(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (looksLikeActionPlan(raw)) return raw;
  if (looksLikeActionPlan(raw.plan)) return raw.plan;
  if (looksLikeActionPlan(raw.actionPlan)) return raw.actionPlan;
  if (looksLikeActionPlan(raw.result)) return raw.result;
  return null;
}

function normalizeInsertStepToAddOrInsert(step, canvasType = null) {
  // Supported legacy insert formats:
  // - step.position.after = <nodeKey>
  // - step.position.before = <nodeKey>
  const pos = step?.position;
  const afterKey = normalizeStr(pos?.after);
  const beforeKey = normalizeStr(pos?.before);

  const insertMode = afterKey ? "insert_after" : beforeKey ? "insert_before" : null;
  const anchorKey = afterKey || beforeKey;
  if (!insertMode || !anchorKey) return null;

  const node = step?.node && typeof step.node === "object" ? step.node : null;
  if (!node) return null;

  const rawType = normalizeStr(node.type);
  const type = normalizeNodeTypeString(rawType, { canvasType });
  const subType = normalizeStr(node.subType);
  const name = normalizeStr(node.name) || normalizeStr(node.label);

  if (!type || !name) return null;

  return {
    id: normalizeStr(step.id) || "",
    kind: "add_or_insert",
    insertMode,
    anchorTarget: { by: "key", value: anchorKey },
    planNodes: [
      {
        type,
        ...(subType ? { subType } : null),
        name,
      },
    ],
  };
}

/** Resolve anchorTarget to a node key using workflowContext nodes */
function resolveAnchorToNodeKey(anchorTarget, nodes) {
  if (!anchorTarget?.value || !Array.isArray(nodes) || nodes.length === 0) return null;
  const by = normalizeStr(anchorTarget.by) || "key";
  const value = normalizeStr(anchorTarget.value);
  if (!value) return null;
  if (by === "key") return value;
  const node = nodes.find((n) => {
    const k = (n.key || n.id || "").toString();
    const name = (n.name || n.label || "").toString();
    const type = (n.type || n.subType || "").toString();
    if (by === "label") return name === value || k === value;
    if (by === "type") return type === value;
    return false;
  });
  return node ? (node.key || node.id) : null;
}

/** Inject branch metadata when IFELSE_V2 branch nodes lack branch */
function postProcessIfElseBranchMetadata(step) {
  const nodes = step?.planNodes;
  if (!Array.isArray(nodes) || nodes.length < 2) return;
  const first = nodes[0];
  const firstType = (first?.type || "").toString().toUpperCase();
  if (firstType !== "IFELSE_V2") return;
  const n1 = nodes[1];
  if (!n1) return;
  const n1Type = (n1.type || "").toString().toUpperCase();
  if (n1Type === "IFELSE_V2") return;
  if (nodes.length >= 3) {
    const n2 = nodes[2];
    if (n2) {
      const n2Type = (n2.type || "").toString().toUpperCase();
      if (n2Type !== "IFELSE_V2" && n1.branch == null && n2.branch == null) {
        n1.branch = "true";
        n2.branch = "false";
      }
    }
  } else if (n1.branch == null) {
    n1.branch = "false";
  }
}

/** Filter ENDING from planNodes when insert_after targets a non-last node (safety net) */
function postProcessFilterEndingInMiddle(step, workflowContext) {
  const insertMode = normalizeStr(step?.insertMode);
  if (insertMode !== "insert_after") return;
  const nodes = step?.planNodes;
  if (!Array.isArray(nodes) || nodes.length === 0) return;
  const hasEnding = nodes.some((n) => (n?.type || "").toString().toUpperCase() === "ENDING");
  if (!hasEnding) return;
  const wc = workflowContext || {};
  const wcNodes = Array.isArray(wc.nodes) ? wc.nodes : [];
  const wcLinks = Array.isArray(wc.links) ? wc.links : [];
  const lastNode = findLastNodeInChain(wcNodes, wcLinks);
  const anchorKey = resolveAnchorToNodeKey(step.anchorTarget, wcNodes);
  if (!anchorKey || !lastNode) return;
  const lastKey = lastNode.key || lastNode.id;
  if (anchorKey === lastKey) return;
  step.planNodes = nodes.filter((n) => (n?.type || "").toString().toUpperCase() !== "ENDING");
}

function normalizePlanOrClarify({ plan, canvasType, nodeIndex, workflowContext }) {
  const steps = Array.isArray(plan?.steps) ? plan.steps : [];

  const normalizedSteps = [];
  for (const s of steps) {
    if (!s || typeof s !== "object") continue;

    const kind = normalizeStr(s.kind);
    const id = normalizeStr(s.id) || String(normalizedSteps.length + 1);

    // Rewrite legacy insert steps into canonical add_or_insert.
    if (kind === "insert") {
      const rewritten = normalizeInsertStepToAddOrInsert({ ...s, id }, canvasType);
      if (!rewritten) {
        return clarificationPlan({ canvasType, kind: "remove", nodeIndex, message: "Planner returned invalid output. Please rephrase your request." });
      }
      normalizedSteps.push({ ...rewritten, id: rewritten.id || id });
      continue;
    }

    // Drop unsupported synthetic link-edit steps from model output.
    if (kind === "update" && s.newLink != null && s.patchIntent == null) {
      // If the model is trying to rewire links via a custom field, we rely on deterministic insert/remove rewire instead.
      // Treat this as no-op (do not include the step).
      continue;
    }

    const step = { ...s, id, kind };

    if (kind === "remove" || kind === "update") {
      const normalizedTarget = normalizeStepTarget(step);
      if (!normalizedTarget?.value) {
        return clarificationPlan({ canvasType, kind, nodeIndex });
      }
      step.target = normalizedTarget;
      // Normalize type when targeting by type so alias types match canvas nodes.
      if (step.target.by === "type") {
        step.target.value = normalizeNodeTypeString(step.target.value, { canvasType }) || step.target.value;
      }
    }

    if (kind === "add_or_insert" || kind === "build") {
      // Canonical insertion step: must carry planNodes.
      if (!Array.isArray(step.planNodes) || step.planNodes.length === 0) {
        return clarificationPlan({ canvasType, kind: "remove", nodeIndex, message: "Planner returned invalid output. Please rephrase your request." });
      }
      // Normalize each planNode type to canonical (e.g. HTTP_REQUEST → HTTP).
      for (const planNode of step.planNodes) {
        if (planNode && typeof planNode.type === "string") {
          planNode.type = normalizeNodeTypeString(planNode.type, { canvasType }) || planNode.type;
        }
      }
      // Post-process IFELSE: inject branch metadata when missing.
      postProcessIfElseBranchMetadata(step);
      // Post-process: filter ENDING when insert_after targets a non-last node.
      postProcessFilterEndingInMiddle(step, workflowContext);
      // For insert_after/insert_before, require anchorTarget.
      const insertMode = normalizeStr(step.insertMode);
      if ((insertMode === "insert_after" || insertMode === "insert_before") && !normalizeStr(step.anchorTarget?.value)) {
        return clarificationPlan({ canvasType, kind: "remove", nodeIndex });
      }
    }

    normalizedSteps.push(step);
  }

  return {
    version: ACTION_PLAN_VERSION,
    canvasType: plan?.canvasType ?? canvasType ?? null,
    needsClarification: Boolean(plan?.needsClarification),
    clarificationQuestions: Array.isArray(plan?.clarificationQuestions) ? plan.clarificationQuestions : [],
    summary: typeof plan?.summary === "string" ? plan.summary : null,
    steps: normalizedSteps,
  };
}

export class PlanActionHandler {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
    this.contextBuilder = new ContextBuilder();
    this.modelSelector = new ModelSelector();
  }

  buildSystemPrompt({ canvasType, adapterRulesText }) {
    return `You are an AI planner for a visual canvas editor.

You must output ONLY valid JSON that matches ActionPlan v1.

Top-level required fields:
- version: "${ACTION_PLAN_VERSION}"
- canvasType: string | null
- needsClarification: boolean
- clarificationQuestions: string[]
- summary: string | null
- steps: step[]

Allowed step kinds and required fields:

1) remove
- kind: "remove"
- target: { by: "key"|"label"|"type"|"selected", value: NON-EMPTY string }

2) update
- kind: "update"
- target: { by: "key"|"label"|"type"|"selected", value: NON-EMPTY string }
- patchIntent: { go_data?: object, name?: string, text?: string }

3) add_or_insert
- kind: "add_or_insert"
- insertMode: "append" | "insert_after" | "insert_before"
- if insertMode is insert_after/insert_before: anchorTarget: { by: "key"|"label"|"type", value: NON-EMPTY string }
- planNodes: array of nodes to add, each with at least { type: string, name: string }
- Use ONLY these canonical node types in planNodes[].type: HTTP (not HTTP_REQUEST), TRANSFORMER_V3, IFELSE_V2, LOG, SELF_EMAIL, CREATE_RECORD_V2, UPDATE_RECORD_V2, DB_FIND_ALL_V2, DB_FIND_ONE_V2, GPT, GPT_RESEARCHER, GPT_WRITER, GPT_ANALYZER, GPT_SUMMARIZER, DELAY_V2, ITERATOR_V2, CUSTOM_WEBHOOK, FORM_TRIGGER, TIME_BASED_TRIGGER_V2, SHEET_TRIGGER_V2, SHEET_DATE_FIELD_TRIGGER, plus form question types (e.g. SHORT_TEXT, EMAIL, WELCOME, ENDING) when on Form canvas. Never use TRIGGER_SETUP_V3 or dummy (placeholders).
- For IFELSE_V2: when adding a condition with two branches, include IFELSE_V2 followed by 2 nodes. ALWAYS add "branch": "true" to the first branch node and "branch": "false" to the second. Include config.conditions for IFELSE_V2 (e.g. [{ field, operator, value }]). Use operator "gt" not ">" for greater-than (similarly: lt, gte, lte). When insert_after targets a node that is NOT the last in the form, do NOT include ENDING. The true branch connects to the existing flow (the node that currently follows the anchor). Only include: IFELSE_V2 + the false-branch node (e.g. SHORT_TEXT for error). Use branch: "false" on that node. The true branch has no new node—it connects to the anchor's successor.

4) explain
- kind: "explain"
- message: string

Critical requirements:
- For remove/update you MUST include target.by and target.value.
- Use the provided nodeIndex and workflowContext.links to pick exact node keys when possible.
- NEVER output kind "insert" and NEVER output custom link fields like newLink.
- If you cannot confidently determine targets/anchors, set needsClarification=true, provide clarificationQuestions, and return steps=[].
- Placement for add_or_insert: When the user asks to add or insert node(s) but does not specify where (e.g. no "after X", "before Y", "at end", "before the end node"), and nodeIndex shows the canvas already has nodes, set needsClarification=true, clarificationQuestions=["Where should I add it? (e.g. after, or before the end node)"], and steps=[].
- When canvasType is WORKFLOW_CANVAS, you are on the Form canvas. Use "form" not "workflow" in all user-facing text (clarificationQuestions, summary).

CanvasType: ${canvasType ?? "null"}

CANVAS_RULES:
${adapterRulesText}

Return JSON only.`;
  }

  async handle(req, res) {
    const body = req.body || {};
    const { canvasType, userMessage, nodeIndex, workflowContext, userContext } = body;

    if (!this.openai) {
      return res.status(200).json(
        clarificationPlan({
          canvasType,
          kind: "remove",
          nodeIndex,
          message: "AI planner is not configured (missing OPENAI_API_KEY).",
        })
      );
    }

    const enriched = await this.contextBuilder.build({
      workflowContext: workflowContext || {},
      userContext: userContext || {},
    });

    const adapterRulesText =
      enriched?.workflow?.canvasRulesText && typeof enriched.workflow.canvasRulesText === "string"
        ? enriched.workflow.canvasRulesText
        : "- Respect allowed node types and positional constraints.\n- Do not create triggers on Form canvas.";

    const system = this.buildSystemPrompt({ canvasType, adapterRulesText });
    const modelConfig = this.modelSelector.getModel("conversation");

    const payload = {
      canvasType: canvasType ?? null,
      userMessage: String(userMessage || "").slice(0, 5000),
      nodeIndex: Array.isArray(nodeIndex) ? nodeIndex.slice(0, 300) : [],
      workflowContext: enriched?.workflow || {},
    };

    const response = await this.openai.chat.completions.create({
      model: modelConfig.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: { type: "json_object" },
      max_tokens: modelConfig.maxTokens,
      temperature: 0,
    });

    const content = response.choices?.[0]?.message?.content || "";
    const parsed = safeJsonParse(content);
    const rawPlan = coerceToActionPlan(parsed);

    if (!rawPlan) {
      return res.status(200).json(
        clarificationPlan({
          canvasType,
          kind: "remove",
          nodeIndex: payload.nodeIndex,
          message: "Planner returned invalid output. Please rephrase your request.",
        })
      );
    }

    if (rawPlan.version == null || rawPlan.version === "") {
      rawPlan.version = ACTION_PLAN_VERSION;
    }

    if (rawPlan.version !== ACTION_PLAN_VERSION) {
      return res.status(200).json(
        clarificationPlan({
          canvasType,
          kind: "remove",
          nodeIndex: payload.nodeIndex,
          message: "Planner returned invalid output. Please rephrase your request.",
        })
      );
    }

    const normalized = normalizePlanOrClarify({
      plan: rawPlan,
      canvasType,
      nodeIndex: payload.nodeIndex,
      workflowContext: payload.workflowContext,
    });
    return res.status(200).json(normalized);
  }
}
