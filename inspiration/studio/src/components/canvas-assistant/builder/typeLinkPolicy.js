/**
 * Type-only link policy registry for start/terminal nodes.
 * Source of truth: canonical node definitions (denyToLink/denyFromLink).
 * If a node's type is not in the registry, it is not start/terminal.
 */

import {
  JUMP_TO_TYPE,
  WORKFLOW_SETUP_TYPE,
  TOOL_OUTPUT_TYPE,
  TOOL_OUTPUT_V2_TYPE,
  SKIP_TYPE,
  BREAK_TYPE,
  SUCCESS_SETUP_TYPE,
  END_NODE_V3_TYPE,
  WEBHOOK_TYPE,
  WEBHOOK_TYPE_V2,
  TOOL_INPUT_TYPE,
  TOOL_INPUT_V2_TYPE,
  TIME_BASED_TRIGGER,
  TIME_BASED_TRIGGER_V2_TYPE,
  INPUT_SETUP_TYPE,
  START_NODE_V2_TYPE,
  SHEET_TRIGGER_V2_TYPE,
  CONNECTION_SETUP_TYPE,
  AGENT_INPUT,
  AGENT_WORKFLOW,
} from "../../canvas/extensions/constants/types.js";

/** Form question types (terminal/start) - string values match QuestionType enum */
const FORM_ENDING_TYPE = "ENDING";
const FORM_WELCOME_TYPE = "WELCOME";

/** Node types that must have 0 outgoing links (terminal). */
export const TERMINAL_NODE_TYPES = new Set([
  JUMP_TO_TYPE,
  WORKFLOW_SETUP_TYPE,
  TOOL_OUTPUT_TYPE,
  TOOL_OUTPUT_V2_TYPE,
  SKIP_TYPE,
  BREAK_TYPE,
  SUCCESS_SETUP_TYPE,
  END_NODE_V3_TYPE,
  FORM_ENDING_TYPE,
]);

/** Node types that must have 0 incoming links (start). */
export const START_NODE_TYPES = new Set([
  WEBHOOK_TYPE,
  WEBHOOK_TYPE_V2,
  TOOL_INPUT_TYPE,
  TOOL_INPUT_V2_TYPE,
  TIME_BASED_TRIGGER,
  TIME_BASED_TRIGGER_V2_TYPE,
  INPUT_SETUP_TYPE,
  START_NODE_V2_TYPE,
  SHEET_TRIGGER_V2_TYPE,
  CONNECTION_SETUP_TYPE,
  AGENT_INPUT,
  AGENT_WORKFLOW,
  FORM_WELCOME_TYPE,
]);

/**
 * Get link policy for a node type (type-only; no per-node flags).
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
