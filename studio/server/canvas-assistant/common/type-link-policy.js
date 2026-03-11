/**
 * Type-only link policy registry for start/terminal nodes (server mirror).
 * Must stay in sync with src/components/canvas-assistant/builder/typeLinkPolicy.js.
 * If a node's type is not in the registry, it is not start/terminal.
 */

/** Node types that must have 0 outgoing links (terminal). */
export const TERMINAL_NODE_TYPES = new Set([
  "JUMP_TO",
  "Workflow Setup",
  "TOOL_OUTPUT",
  "TOOL_OUTPUT_V2",
  "SKIP",
  "BREAK",
  "Success Setup",
  "END_NODE_V3",
  "ENDING",
]);

/** Node types that must have 0 incoming links (start). */
export const START_NODE_TYPES = new Set([
  "CUSTOM_WEBHOOK",
  "WEBHOOK_V2",
  "TOOL_INPUT",
  "TOOL_INPUT_V2",
  "TIME_BASED_TRIGGER",
  "TIME_BASED_TRIGGER_V2",
  "Input Setup",
  "START_NODE_V2",
  "SHEET_TRIGGER_V2",
  "Connection Setup",
  "AGENT_INPUT",
  "AGENT_WORKFLOW",
  "WELCOME",
]);

/**
 * Get link policy for a node type (type-only).
 * @param {string} type - Node type or subType
 * @returns {{ denyToLink: boolean, denyFromLink: boolean }}
 */
export function getTypeLinkPolicy(type) {
  if (!type || typeof type !== "string") {
    return { denyToLink: false, denyFromLink: false };
  }
  const t = type.trim();
  return {
    denyToLink: TERMINAL_NODE_TYPES.has(t),
    denyFromLink: START_NODE_TYPES.has(t),
  };
}
