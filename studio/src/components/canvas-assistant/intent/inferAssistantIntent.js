/**
 * Intent inference for Canvas Assistant.
 * Routes by canvasType + request semantics (no keyword-only coupling).
 * Intent kinds: build_form | build_workflow | automation_request | modify_form | chat
 * Operation metadata: actionKind, operation, targetHint, needsTarget, targetStrategy (focused when pronoun).
 */

const FORM_CANVAS = "WORKFLOW_CANVAS";
const WORKFLOW_CANVAS = "WC_CANVAS";

/** Pronoun anchors: resolve via focused/selected node, not by name/type. */
const PRONOUN_ANCHORS = new Set(["this", "that", "selected", "current", "it", "the selected node", "the current node"]);

/** Extract anchor phrase after "after" or "before" for insert intent. Returns trimmed string or null. */
function extractTargetHint(text) {
  const lower = (text || "").toLowerCase().trim();
  const afterMatch = lower.match(/\bafter\s+(?:the\s+)?(?:node\s+)?["']?([^."]+?)["']?(?:\s+node)?\.?$/i);
  if (afterMatch) return afterMatch[1].trim();
  const beforeMatch = lower.match(/\bbefore\s+(?:the\s+)?(?:node\s+)?["']?([^."]+?)["']?(?:\s+node)?\.?$/i);
  if (beforeMatch) return beforeMatch[1].trim();
  const afterMid = lower.match(/\bafter\s+([^,.]{2,}?)(?:\s*[,.]|$)/);
  if (afterMid) return afterMid[1].trim();
  const beforeMid = lower.match(/\bbefore\s+([^,.]{2,}?)(?:\s*[,.]|$)/);
  if (beforeMid) return beforeMid[1].trim();
  return null;
}

/** True if hint is a pronoun that should resolve to focused node. */
function isPronounAnchor(hint) {
  if (!hint || typeof hint !== "string") return false;
  return PRONOUN_ANCHORS.has(hint.trim().toLowerCase());
}

/** Check if text contains explicit "after" or "before" anchor language. */
function hasAnchorLanguage(text) {
  const lower = (text || "").toLowerCase();
  return /\bafter\s+/.test(lower) || /\bbefore\s+/.test(lower);
}

// Schedule/event automation signals (Form canvas → chat, not generate-flow)
// Centralized list: if text matches any phrase, Form canvas treats as automation_request and does not run generate-flow.
const AUTOMATION_SIGNALS = [
  "at 12pm",
  "at 12 pm",
  "at noon",
  "at 12 noon",
  "every day",
  "every hour",
  "when i get email",
  "when email arrives",
  "when i receive",
  "check my email",
  "check my mail",
  "summarize my email",
  "summarize my mail",
  "run at",
  "trigger when",
  "schedule",
  "scheduled",
  "cron",
  "daily",
  "weekly",
  "monthly",
  "on a schedule",
  "at a specific time",
  "when something happens",
  "when form is submitted",
  "when record is created",
  "when webhook",
];

// Modify-existing-form signals (Form canvas → modify_form; checked before build_form)
const FORM_MODIFY_SIGNALS = [
  "add ",
  "insert ",
  "append ",
  " after ",
  " before ",
  " between ",
  " connect ",
  " attach ",
  "add a node",
  "add an ",
  "insert a node",
  "insert an ",
  "add email node",
  "add short text node",
  "add long text node",
  "add number node",
  "add date node",
  "add dropdown node",
  "add single choice",
  "add multiple choice",
];

// Replace node type signals (modify_form with operation replace_node) — must be checked before UPDATE_SIGNALS
const REPLACE_NODE_SIGNALS = [
  "replace ",
  "replace the ",
  "replace this with ",
  "replace that with ",
  "swap ",
  "swap the ",
];

// Update node signals (modify_form with operation update)
const UPDATE_SIGNALS = [
  "update ",
  "change ",
  "edit ",
  "modify ",
  "update the ",
  "change the ",
  "edit the ",
  "update node",
  "change node",
  "edit node",
];

// Remove node signals (modify_form with operation remove). Include common typos so delete doesn't fall back to chat.
const REMOVE_SIGNALS = [
  "remove ",
  "delete ",
  "remove the ",
  "delete the ",
  "remove node",
  "delete node",
  "remove this",
  "delete this",
  "remve ",
  "remve the ",
  "delte ",
  "delte the ",
];

// Form-build signals (Form canvas → build_form)
const FORM_BUILD_SIGNALS = [
  "build a form",
  "build me a form",
  "create a form",
  "create me a form",
  "make a form",
  "make me a form",
  "form to collect",
  "form with",
  "add form questions",
  "form questions",
  "form fields",
  "collect name",
  "collect email",
  "collect feedback",
  "feedback form",
  "registration form",
  "contact form",
  "survey form",
  "form that asks",
  "questions for my form",
  "add questions",
  "form for",
  "build form",
  "create form",
];

// Workflow-build signals (Workflow canvas → build_workflow)
const WORKFLOW_BUILD_SIGNALS = [
  "build a workflow",
  "build a flow",
  "build me a",
  "create a workflow",
  "create a flow",
  "create me a",
  "generate a workflow",
  "generate a flow",
  "make a workflow",
  "make a flow",
  "make me a workflow",
  "set up a workflow",
  "set up a flow",
];

function textMatchesSignals(text, signals) {
  const lower = (text || "").toLowerCase().trim();
  return signals.some((phrase) => lower.includes(phrase.toLowerCase()));
}

/** Polite filler phrases that must not be treated as the delete target (e.g. "remove for me" -> target is null). */
const REMOVE_FILLER_PHRASES = [
  "for me",
  "please",
  "thanks",
  "thank you",
  "right now",
  "can you",
  "could you",
  "would you",
  "will you",
  "if you can",
  "i need you to",
  "i want you to",
  "that one",
  "it",
];

function normalizeRemoveTargetHint(rawHint) {
  if (!rawHint || typeof rawHint !== "string") return null;
  let hint = rawHint.trim();
  if (!hint) return null;

  // Remove clauses like "after X" / "before X" (not meaningful for delete intent)
  hint = hint.replace(/\s+\b(after|before)\b\s+.*$/i, "").trim();

  // Strip generic words that users often add ("question", "node", etc.)
  hint = hint.replace(/\b(question|questions|node|nodes|field|fields)\b/gi, "").trim();

  // Strip polite filler phrases so "can you remove for me" / "remove for me" don't treat "for me" as target
  const lower = hint.toLowerCase();
  for (const phrase of REMOVE_FILLER_PHRASES) {
    const re = new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`, "gi");
    hint = hint.replace(re, "").trim();
  }

  // Collapse whitespace after removals
  hint = hint.replace(/\s{2,}/g, " ").trim();

  return hint || null;
}

/** Extract target hint for replace_node: "replace X with Y" -> X (node to replace). */
function extractReplaceTargetHint(text) {
  const lower = (text || "").toLowerCase().trim();
  if (lower.includes("replace this with") || lower.endsWith("replace this with")) return "this";
  if (lower.includes("replace that with") || lower.endsWith("replace that with")) return "that";
  const match = (text || "").match(/\breplace\s+(?:the\s+)?(?:node\s+)?["']?([^"']+?)["']?\s+with\s+/i);
  if (match) return match[1].trim();
  const match2 = (text || "").match(/\breplace\s+(.+?)\s+with\s+/i);
  if (match2) return match2[1].replace(/\b(the|node)\b/gi, "").trim();
  return null;
}

/** Map operation to canonical actionKind for executor. */
const OPERATION_TO_ACTION_KIND = {
  append: "add_nodes",
  insert_after: "insert_after",
  insert_before: "insert_before",
  replace_form: "replace_graph",
  replace_node: "replace_node",
  update: "update_node",
  remove: "remove_node",
};

/** Operations that require a target node to be resolved. */
const OPERATIONS_NEEDING_TARGET = new Set(["insert_after", "insert_before", "update", "remove", "replace_node"]);

function buildOperationMeta(operation, targetHint) {
  const needsTarget = OPERATIONS_NEEDING_TARGET.has(operation);
  const isFocused = targetHint && isPronounAnchor(targetHint);
  return {
    actionKind: OPERATION_TO_ACTION_KIND[operation] || "add_nodes",
    operation,
    targetHint: targetHint || null,
    needsTarget,
    targetStrategy: isFocused ? "focused" : undefined,
  };
}

/**
 * Infer assistant intent from canvas type and user text.
 * @param {{ canvasType: string | null, text: string, workflowContext?: object }} options
 * @returns {{ kind, confidence, reason?, actionKind?, operation?, targetHint?, needsTarget?, targetStrategy? }}
 */
export function inferAssistantIntent({ canvasType, text, workflowContext = {} }) {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return {
      kind: "chat",
      confidence: "high",
      reason: "empty input",
      actionKind: undefined,
      operation: undefined,
      targetHint: null,
      needsTarget: false,
    };
  }

  // Form canvas (WORKFLOW_CANVAS). Resolution order: automation_request → remove → update → modify_form → build_form → chat
  if (canvasType === FORM_CANVAS) {
    if (textMatchesSignals(trimmed, AUTOMATION_SIGNALS)) {
      return {
        kind: "automation_request",
        confidence: "high",
        reason: "schedule/event automation phrasing on Form canvas",
        actionKind: undefined,
        operation: undefined,
        targetHint: null,
        needsTarget: false,
      };
    }
    if (textMatchesSignals(trimmed, REMOVE_SIGNALS)) {
      const lower = trimmed.toLowerCase();
      const pronounHint = (lower.includes(" this") || lower.includes(" that") || lower.endsWith("this") || lower.endsWith("that")) ? "this" : null;
      // Capture everything after remove/delete (avoid non-greedy 1-char captures), then normalize.
      const rawHint =
        (/\b(?:remove|delete|remve|delte)\s+(?:the\s+)?(?:(?:node|question|field)\s+)?["']?([^"'.]+)["']?/i.exec(trimmed)?.[1]?.trim()) ||
        null;
      const explicitHint = normalizeRemoveTargetHint(rawHint);
      const targetHint = explicitHint || pronounHint;
      const meta = buildOperationMeta("remove", targetHint);
      return {
        kind: "modify_form",
        ...meta,
        confidence: "high",
        reason: "remove/delete phrasing on Form canvas",
      };
    }
    if (textMatchesSignals(trimmed, REPLACE_NODE_SIGNALS) && /\bwith\b/i.test(trimmed)) {
      const targetHint = extractReplaceTargetHint(trimmed) || (trimmed.toLowerCase().includes("this") ? "this" : null);
      const meta = buildOperationMeta("replace_node", targetHint);
      return {
        kind: "modify_form",
        ...meta,
        confidence: "high",
        reason: "replace node phrasing on Form canvas",
      };
    }
    if (textMatchesSignals(trimmed, UPDATE_SIGNALS)) {
      const lower = trimmed.toLowerCase();
      const pronounHint = (lower.includes(" this") || lower.includes(" that") || lower.endsWith("this") || lower.endsWith("that")) ? "this" : null;
      const explicitHint = (/\b(?:update|change|edit)\s+(?:the\s+)?(?:node\s+)?["']?([^."]+?)["']?/i.exec(trimmed)?.[1]?.trim()) || null;
      const meta = buildOperationMeta("update", explicitHint || pronounHint || null);
      return {
        kind: "modify_form",
        ...meta,
        confidence: "high",
        reason: "update/edit phrasing on Form canvas",
      };
    }
    if (textMatchesSignals(trimmed, FORM_MODIFY_SIGNALS)) {
      const hint = extractTargetHint(trimmed);
      const hasAnchor = hasAnchorLanguage(trimmed);
      const operation =
        hint !== null && hint !== undefined && hasAnchor
          ? /\bafter\s+/i.test(trimmed)
            ? "insert_after"
            : "insert_before"
          : "append";
      const meta = buildOperationMeta(operation, hint || null);
      return {
        kind: "modify_form",
        ...meta,
        confidence: "high",
        reason: "modify/add/insert phrasing on Form canvas",
      };
    }
    if (textMatchesSignals(trimmed, FORM_BUILD_SIGNALS)) {
      const meta = buildOperationMeta("replace_form", null);
      return {
        kind: "build_form",
        ...meta,
        confidence: "high",
        reason: "form-build phrasing on Form canvas",
      };
    }
    const genericBuild = /\b(build|create|make|add)\s+(me\s+)?(a\s+)?/i.test(trimmed);
    if (genericBuild && !textMatchesSignals(trimmed, WORKFLOW_BUILD_SIGNALS)) {
      const meta = buildOperationMeta("replace_form", null);
      return {
        kind: "build_form",
        ...meta,
        confidence: "medium",
        reason: "generic build phrasing on Form canvas",
      };
    }
    return {
      kind: "chat",
      confidence: "high",
      reason: "Form canvas, no build/automation/modify signals",
      actionKind: undefined,
      operation: undefined,
      targetHint: null,
      needsTarget: false,
    };
  }

  // Workflow canvas (WC_CANVAS)
  if (canvasType === WORKFLOW_CANVAS) {
    if (textMatchesSignals(trimmed, REMOVE_SIGNALS)) {
      const hint = extractTargetHint(trimmed) || (trimmed.toLowerCase().includes("this") ? "this" : null);
      const meta = buildOperationMeta("remove", hint);
      return {
        kind: "modify_form",
        ...meta,
        confidence: "high",
        reason: "remove/delete phrasing on Workflow canvas",
      };
    }
    if (textMatchesSignals(trimmed, UPDATE_SIGNALS)) {
      const hint = extractTargetHint(trimmed) || (trimmed.toLowerCase().includes("this") ? "this" : null);
      const meta = buildOperationMeta("update", hint);
      return {
        kind: "modify_form",
        ...meta,
        confidence: "high",
        reason: "update/edit phrasing on Workflow canvas",
      };
    }
    if (textMatchesSignals(trimmed, WORKFLOW_BUILD_SIGNALS)) {
      const meta = buildOperationMeta("append", null);
      return {
        kind: "build_workflow",
        ...meta,
        confidence: "high",
        reason: "workflow-build phrasing on Workflow canvas",
      };
    }
    const genericBuild = /\b(build|create|generate|make)\s+(a\s+)?(workflow|flow)/i.test(trimmed);
    if (genericBuild) {
      const meta = buildOperationMeta("append", null);
      return {
        kind: "build_workflow",
        ...meta,
        confidence: "high",
        reason: "workflow/flow mentioned on Workflow canvas",
      };
    }
    return {
      kind: "chat",
      confidence: "high",
      reason: "Workflow canvas, no build signals",
      actionKind: undefined,
      operation: undefined,
      targetHint: null,
      needsTarget: false,
    };
  }

  return {
    kind: "chat",
    confidence: "high",
    reason: "unknown or missing canvas type",
    actionKind: undefined,
    operation: undefined,
    targetHint: null,
    needsTarget: false,
  };
}
