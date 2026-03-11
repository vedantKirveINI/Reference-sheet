/**
 * Shared node type configs - nodes available on multiple canvas types
 * These nodes are available on Form, Workflow, and potentially other canvas types
 * Empty array [] for applicableCanvases means available on all canvases
 */

/**
 * @typedef {Object} SharedTypeConfig
 * @property {string} configSchema - Short description of allowed JSON keys and types
 * @property {string} instructions - 1–3 sentences of type-specific semantics
 * @property {Array<string>} applicableCanvases - Empty array [] means available on all canvases
 * @property {string} [customPromptFragment] - Optional override fragment for complex types
 * @property {string} [shortDescription] - One-line description for prompt (e.g. "HTTP Request (API calls)")
 */

/** @type {Record<string, SharedTypeConfig>} */
export const SETUP_SHARED_NODE_TYPES = {
  HTTP: {
    shortDescription: "HTTP Request (API calls)",
    configSchema: "url (string, required), method (string: GET, POST, PUT, DELETE, PATCH), headers (object, optional), body (string or object, optional)",
    instructions: "Use the workflow goal and data at node to choose a sensible URL and method. Use {{StepName.field}} syntax when referencing previous step output in URL or body.",
    applicableCanvases: [], // Available on Form and Workflow
  },
  TRANSFORMER_V3: {
    shortDescription: "Transform/reshape data",
    configSchema: "expression (string, JavaScript expression that transforms the input)",
    instructions: "The expression receives the input data and should return the transformed value. Use {{StepName.field}} for references to previous steps. Keep expressions valid JavaScript.",
    applicableCanvases: [], // Available on Form and Workflow
  },
  IFELSE_V2: {
    shortDescription: "Conditional branching (can have multiple outgoing routes). See IFELSE_V2 section below.",
    configSchema: "conditions (array of condition objects with field, operator, value). Each condition can have conditionGroup for AND/OR.",
    instructions: "Conditions are evaluated in order. Use conditionGroup for grouping AND/OR logic. Reference previous step fields with {{StepName.field}}. Return a minimal valid structure if complex.",
    customPromptFragment: "For IFELSE_V2, return only the conditions array. Each condition: { field, operator, value } or nested conditionGroup.",
    applicableCanvases: [], // Available on Form and Workflow
  },
  LOG: {
    shortDescription: "Logging",
    configSchema: "message (string, optional), logLevel (string: info, warn, error, optional)",
    instructions: "Optional message to log; can use {{StepName.field}}. logLevel defaults to info.",
    applicableCanvases: [], // Available on Form and Workflow (canonical; LOG_V2 normalizes to LOG)
  },
  LOG_V2: {
    shortDescription: "Logging",
    configSchema: "message (string, optional), logLevel (string: info, warn, error, optional)",
    instructions: "Optional message to log; can use {{StepName.field}}. logLevel defaults to info.",
    applicableCanvases: [], // Available on Form and Workflow (alias; prefer LOG)
  },
  JUMP_TO: {
    shortDescription: "Jump to another step",
    configSchema: "targetStepKey (string) or targetStepName (string) - the key or name of the step to jump to",
    instructions: "Reference the target step by its key or name from the workflow. Return which step to jump to.",
    applicableCanvases: [], // Available on Form and Workflow
  },
};

/** Default config for shared types not yet in the map (fallback). */
export const DEFAULT_SHARED_TYPE_CONFIG = {
  shortDescription: "Shared node",
  configSchema: "Return only the config keys that this node type accepts. Use dataAtNode and workflow goal to fill values. Use {{StepName.field}} for references.",
  instructions: "Infer the node's configuration from the data available at this node and the workflow goal. Do not invent required values that are missing; if critical info is missing, you will return needs_clarification later.",
  applicableCanvases: [], // Default to available on all canvases
};

/**
 * Get shared node type config
 * @param {string} nodeType
 * @returns {SharedTypeConfig}
 */
export function getSharedNodeTypeConfig(nodeType) {
  return SETUP_SHARED_NODE_TYPES[nodeType] || null;
}
