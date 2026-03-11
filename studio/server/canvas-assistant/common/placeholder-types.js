/**
 * Placeholder / forbidden node types - NEVER output these in AI-generated plans.
 * Filter these out when building prompt sections from config.
 *
 * - TRIGGER_SETUP_V3: UI placeholder for unconfigured trigger. When present and user
 *   presses Run, the UI shows error state and asks "what should this be - manual or something else?"
 * - dummy: Placeholder for multi-route structure (IFELSE, HITL). server: null in canvas.json.
 * - FORMULA_FX: Removed from AI journey. Not present in canvas.json; do not suggest or generate.
 */
export const PLACEHOLDER_NODE_TYPES = [
  "TRIGGER_SETUP_V3",
  "TRIGGER_SETUP",
  "TRIGGER_SETUP_NODE",
  "dummy",
  "FORMULA_FX",
];

export function isPlaceholderType(type) {
  return type && PLACEHOLDER_NODE_TYPES.includes(String(type).trim());
}
