/**
 * Canonical node-type normalizer for AI-produced node type strings.
 * Maps aliases and legacy names to types the frontend NODE_REGISTRY can instantiate.
 */

/** Alias map: raw/legacy type → canonical type (frontend-registry key). */
const NODE_TYPE_ALIASES = {
  HTTP_REQUEST: "HTTP",
  IF_ELSE: "IFELSE_V2",
  IF_ELSE_V2: "IFELSE_V2",
  LOG_V2: "LOG",
  TRIGGER_SETUP: "TRIGGER_SETUP_V3",
  TRIGGER_SETUP_NODE: "TRIGGER_SETUP_V3",
  DELAY: "DELAY_V2",
  ITERATOR: "ITERATOR_V2",
};

/**
 * Normalize a node type string to a canonical type the frontend can create.
 * @param {string} rawType - Type string from planner/AI (e.g. "HTTP_REQUEST", "external/slack/...")
 * @param {object} [options]
 * @param {string} [options.canvasType] - Canvas type (for future use / logging)
 * @returns {{ canonical: string, changed: boolean }} - canonical type and whether it was changed by alias
 */
function normalizeNodeType(rawType, options = {}) {
  const canvasType = options.canvasType ?? null;
  if (rawType == null || typeof rawType !== "string") {
    return { canonical: "", changed: false };
  }

  const trimmed = rawType.trim();
  if (!trimmed) {
    return { canonical: "", changed: false };
  }

  // Preserve external identifiers and Integration unchanged
  if (trimmed.startsWith("external/") || trimmed === "Integration" || trimmed === "INTEGRATION") {
    return { canonical: trimmed, changed: false };
  }

  const upper = trimmed.toUpperCase();
  const canonical = NODE_TYPE_ALIASES[upper] ?? upper;
  const changed = canonical !== upper;

  return { canonical, changed };
}

/**
 * Normalize node type and return only the canonical string (for callers that don't need changed flag).
 * @param {string} rawType
 * @param {object} [options]
 * @returns {string}
 */
function normalizeNodeTypeString(rawType, options = {}) {
  return normalizeNodeType(rawType, options).canonical;
}

export { normalizeNodeType, normalizeNodeTypeString, NODE_TYPE_ALIASES };
