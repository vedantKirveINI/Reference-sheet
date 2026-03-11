/**
 * Form-specific rules and constants
 * Defines what nodes are allowed/forbidden on Form canvas
 */

import { FORM_CANVAS_MODE } from "../common/canvas-constants.js";

/**
 * Form question node types (available on Form canvas only)
 */
export const FORM_QUESTION_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "MCQ",
  "SCQ",
  "PHONE_NUMBER",
  "ZIP_CODE",
  "DROP_DOWN",
  "DROP_DOWN_STATIC",
  "YES_NO",
  "RANKING",
  "EMAIL",
  "AUTHORIZATION",
  "QUESTION_FX",
  "WELCOME",
  "QUOTE",
  "ENDING",
  "DATE",
  "CURRENCY",
  "KEY_VALUE_TABLE",
  "NUMBER",
  "FILE_PICKER",
  "TIME",
  "SIGNATURE",
  "LOADING",
  "ADDRESS",
  "PDF_VIEWER",
  "TEXT_PREVIEW",
  "AUTOCOMPLETE",
  "CLOUD_FILE_EXPLORER",
  "MULTI_QUESTION_PAGE",
  "QUESTIONS_GRID",
  "PICTURE",
  "QUESTION_REPEATER",
  "COLLECT_PAYMENT",
  "RATING",
  "SLIDER",
  "OPINION_SCALE",
  "TERMS_OF_USE",
  "STRIPE_PAYMENT",
];

/**
 * Shared node types (available on both Form and Workflow)
 * These are imported from common/setup-shared-node-types.js
 */
export const SHARED_NODE_TYPES = [
  "HTTP",
  "TRANSFORMER_V3",
  "IFELSE_V2",
  "LOG",
  "JUMP_TO",
];

/**
 * Trigger node types (FORBIDDEN on Form canvas)
 */
export const TRIGGER_NODE_TYPES = [
  "TRIGGER_SETUP_V3",
  "TRIGGER_SETUP",
  "TRIGGER_SETUP_NODE",
  "FORM_TRIGGER",
  "CUSTOM_WEBHOOK",
  "WEBHOOK_V2",
  "TIME_BASED_TRIGGER_V2",
  "TIME_BASED_TRIGGER",
  "SHEET_TRIGGER_V2",
  "SHEET_TRIGGER",
  "SHEET_DATE_FIELD_TRIGGER",
];

/**
 * Workflow-only node types (FORBIDDEN on Form canvas)
 * These are workflow-specific nodes that should not appear on Form canvas
 */
export const WORKFLOW_ONLY_NODE_TYPES = [
  "GPT",
  "GPT_WRITER",
  "GPT_ANALYZER",
  "GPT_SUMMARIZER",
  "GPT_TRANSLATOR",
  "GPT_CREATIVE",
  "GPT_LEARNING",
  "GPT_CONSULTANT",
  "GPT_RESEARCHER",
  "SELF_EMAIL",
  "DELAY_V2",
  "CREATE_RECORD_V2",
  "UPDATE_RECORD_V2",
  "DELETE_RECORD_V2",
  "EXECUTE_QUERY_V2",
  "DB_FIND_ALL_V2",
  "DB_FIND_ONE_V2",
  "CREATE_SHEET_RECORD_V2",
  "UPDATE_ONE_SHEET_RECORD",
  "UPDATE_SHEET_RECORD_V2",
  "FIND_ALL_SHEET_RECORD_V2",
  "FIND_ONE_SHEET_RECORD_V2",
  "DELETE_SHEET_RECORD",
  "END_NODE_V3",
  "START_NODE_V2",
  "HITL_V2",
  "PERSON_ENRICHMENT_V2",
  "COMPANY_ENRICHMENT_V2",
  "EMAIL_ENRICHMENT_V2",
  "MATCH_PATTERN",
  "FOR_EACH",
  "REPEAT",
  "LOOP_UNTIL",
  "ITERATOR_V2",
  "ARRAY_AGGREGATOR_V2",
  "SKIP_V2",
  "BREAK_V2",
  "TINY_SEARCH_V3",
  "AGENT_SCOUT",
  "AGENT_SCOUT_V3",
  "AGENT_COMPOSER_V3",
];

/**
 * Integration node type (external/... identifiers are transformed to this on the backend)
 */
export const INTEGRATION_NODE_TYPE = "Integration";

/**
 * All allowed node types for Form canvas
 */
export const FORM_ALLOWED_NODE_TYPES = [
  ...FORM_QUESTION_TYPES,
  ...SHARED_NODE_TYPES,
  INTEGRATION_NODE_TYPE,
];

/**
 * All forbidden node types for Form canvas
 */
export const FORM_FORBIDDEN_NODE_TYPES = [
  ...TRIGGER_NODE_TYPES,
  ...WORKFLOW_ONLY_NODE_TYPES,
  "dummy", // Placeholder for multi-route structure (IFELSE, HITL). Not a real node type.
];

/**
 * Check if a node type is allowed on Form canvas
 * @param {string} nodeType - Node type string
 * @returns {boolean}
 */
export function isNodeAllowedOnFormCanvas(nodeType) {
  if (!nodeType) return false;
  
  // Check if it's explicitly forbidden
  if (FORM_FORBIDDEN_NODE_TYPES.includes(nodeType)) {
    return false;
  }
  
  // Check if it's explicitly allowed
  if (FORM_ALLOWED_NODE_TYPES.includes(nodeType)) {
    return true;
  }
  
  // Integrations are allowed (handled separately, not in these lists)
  // Default: disallow unknown types
  return false;
}

/**
 * Check if a node type is a trigger (forbidden on Form canvas)
 * @param {string} nodeType - Node type string
 * @returns {boolean}
 */
export function isTriggerNode(nodeType) {
  return TRIGGER_NODE_TYPES.includes(nodeType);
}

/**
 * Validate Form node order: WELCOME only at first position, ENDING only at last position.
 * @param {Array<{ type: string }>} nodes - Array of node objects with type
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFormNodeOrder(nodes) {
  const errors = [];
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return { valid: true, errors: [] };
  }
  const types = nodes.map((n) => (n.type || "").toUpperCase());
  const welcomeIndex = types.indexOf("WELCOME");
  const endingIndex = types.indexOf("ENDING");
  if (welcomeIndex >= 0 && welcomeIndex !== 0) {
    errors.push("WELCOME node must be the first node in the form.");
  }
  if (endingIndex >= 0 && endingIndex !== types.length - 1) {
    errors.push("ENDING node must be the last node in the form.");
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
