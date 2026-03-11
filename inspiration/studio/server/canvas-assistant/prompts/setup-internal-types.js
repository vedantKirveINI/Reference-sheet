/**
 * Type-specific config schema and instructions for internal node setup.
 * Used by setup-internal prompt to build per-type system prompts.
 * Covers active internal node types (internal = non-Integration).
 */

/**
 * @typedef {Object} InternalTypeConfig
 * @property {string} configSchema - Short description of allowed JSON keys and types for the prompt
 * @property {string} instructions - 1–3 sentences of type-specific semantics
 * @property {string} [customPromptFragment] - Optional override fragment for complex types
 * @property {Array<string>} [applicableCanvases] - Canvas types where this node is available. Empty array [] = all canvases, ["WC_CANVAS"] = workflow-only
 */

/** @type {Record<string, InternalTypeConfig>} */
export const SETUP_INTERNAL_TYPES = {
  HTTP: {
    configSchema: "url (string, required), method (string: GET, POST, PUT, DELETE, PATCH), headers (object, optional), body (string or object, optional)",
    instructions: "Use the workflow goal and data at node to choose a sensible URL and method. Use {{StepName.field}} syntax when referencing previous step output in URL or body.",
    applicableCanvases: [], // Shared node - available on all canvases (also in common/setup-shared-node-types.js)
  },
  TRANSFORMER_V3: {
    configSchema: "expression (string, JavaScript expression that transforms the input)",
    instructions: "The expression receives the input data and should return the transformed value. Use {{StepName.field}} for references to previous steps. Keep expressions valid JavaScript.",
    applicableCanvases: [], // Shared node - available on all canvases (also in common/setup-shared-node-types.js)
  },
  IFELSE_V2: {
    configSchema: "conditions (array of condition objects with field, operator, value). Each condition can have conditionGroup for AND/OR.",
    instructions: "Conditions are evaluated in order. Use conditionGroup for grouping AND/OR logic. Reference previous step fields with {{StepName.field}}. Return a minimal valid structure if complex.",
    customPromptFragment: "For IFELSE_V2, return only the conditions array. Each condition: { field, operator, value } or nested conditionGroup.",
    applicableCanvases: [], // Shared node - available on all canvases (also in common/setup-shared-node-types.js)
  },
  GPT: {
    configSchema: "prompt (string), systemPrompt (string, optional)",
    instructions: "Use the workflow goal to write a clear prompt. Reference available data with {{StepName.field}}. systemPrompt can set the AI behavior.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  GPT_WRITER: {
    configSchema: "prompt (string), systemPrompt (string, optional)",
    instructions: "AI writer node. Use workflow goal for the prompt. Reference {{StepName.field}} for context.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  GPT_ANALYZER: {
    configSchema: "prompt (string), systemPrompt (string, optional)",
    instructions: "AI analyzer node. Prompt should ask for analysis; use {{StepName.field}} for input data.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  GPT_SUMMARIZER: {
    configSchema: "prompt (string), systemPrompt (string, optional)",
    instructions: "AI summarizer. Prompt can request summary of data; reference previous step output with {{StepName.field}}.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  GPT_TRANSLATOR: {
    configSchema: "prompt (string), systemPrompt (string, optional), targetLanguage (string, optional)",
    instructions: "Translation node. Use prompt or targetLanguage; reference content with {{StepName.field}}.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  GPT_CREATIVE: {
    configSchema: "prompt (string), systemPrompt (string, optional)",
    instructions: "Creative AI node. Use workflow goal for the prompt; {{StepName.field}} for context.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  GPT_LEARNING: {
    configSchema: "prompt (string), systemPrompt (string, optional)",
    instructions: "Learning/tutoring AI. Prompt should define the learning task; use {{StepName.field}} for input.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  GPT_CONSULTANT: {
    configSchema: "prompt (string), systemPrompt (string, optional)",
    instructions: "Consultant AI. Use workflow goal for the prompt; reference data with {{StepName.field}}.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  GPT_RESEARCHER: {
    configSchema: "prompt (string), systemPrompt (string, optional)",
    instructions: "Researcher AI. Prompt defines research question; {{StepName.field}} for context.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  SELF_EMAIL: {
    configSchema: "subject (string), body (string), to (string or formula like {{StepName.field}})",
    instructions: "Use workflow goal and data at node for subject and body. Use {{StepName.field}} for dynamic recipient or content from previous steps.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  DELAY_V2: {
    configSchema: "delaySeconds (number) or delayMinutes (number) or delayHours (number)",
    instructions: "Set one of delaySeconds, delayMinutes, or delayHours based on the workflow goal. Use a positive number.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  LOG: {
    configSchema: "message (string, optional), logLevel (string: info, warn, error, optional)",
    instructions: "Optional message to log; can use {{StepName.field}}. logLevel defaults to info.",
    applicableCanvases: [], // Shared node - canonical (LOG_V2 normalizes to LOG)
  },
  LOG_V2: {
    configSchema: "message (string, optional), logLevel (string: info, warn, error, optional)",
    instructions: "Optional message to log; can use {{StepName.field}}. logLevel defaults to info.",
    applicableCanvases: [], // Shared node - alias; prefer LOG
  },
  JUMP_TO: {
    configSchema: "targetStepKey (string) or targetStepName (string) - the key or name of the step to jump to",
    instructions: "Reference the target step by its key or name from the workflow. Return which step to jump to.",
    applicableCanvases: [], // Shared node - available on all canvases (also in common/setup-shared-node-types.js)
  },
  CREATE_RECORD_V2: {
    configSchema: "table/collection identifier, field mappings (object or array of key-value pairs). Keys depend on the data source.",
    instructions: "Map fields from data at node to the record. Use {{StepName.field}} for values. Infer table/collection from goal if possible.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  UPDATE_RECORD_V2: {
    configSchema: "record identifier or filter, field mappings for update. Keys depend on the data source.",
    instructions: "Identify which record to update and which fields to set. Use {{StepName.field}} for values.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  DELETE_RECORD_V2: {
    configSchema: "record identifier or filter to identify the record to delete.",
    instructions: "Use data at node or workflow goal to identify the record to delete. Use {{StepName.field}} for identifiers.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  EXECUTE_QUERY_V2: {
    configSchema: "query (string) or query parameters. Keys depend on the data source.",
    instructions: "Build a query from the workflow goal. Use {{StepName.field}} for dynamic values in the query.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  DB_FIND_ALL_V2: {
    configSchema: "table/collection, filter (optional), sort (optional), limit (optional). Keys depend on the data source.",
    instructions: "Find all records matching criteria. Use {{StepName.field}} in filters. Infer from workflow goal.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  DB_FIND_ONE_V2: {
    configSchema: "table/collection, filter or identifier. Keys depend on the data source.",
    instructions: "Find one record. Use {{StepName.field}} for filter values. Infer from workflow goal.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  CREATE_SHEET_RECORD_V2: {
    configSchema: "sheet/table identifier, column mappings (object). Use {{StepName.field}} for values.",
    instructions: "Map data at node to sheet columns. Use {{StepName.field}} for dynamic values.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  UPDATE_ONE_SHEET_RECORD: {
    configSchema: "sheet/table identifier, record identifier or filter, column mappings.",
    instructions: "Identify the row and columns to update. Use {{StepName.field}} for values.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  UPDATE_SHEET_RECORD_V2: {
    configSchema: "sheet/table identifier, filters, column mappings for rows to update.",
    instructions: "Update multiple rows or one row. Use {{StepName.field}} for values.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  FIND_ALL_SHEET_RECORD_V2: {
    configSchema: "sheet/table identifier, filter (optional), sort (optional).",
    instructions: "Find sheet rows. Use {{StepName.field}} in filters. Infer from workflow goal.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  FIND_ONE_SHEET_RECORD_V2: {
    configSchema: "sheet/table identifier, filter or row identifier.",
    instructions: "Find one sheet row. Use {{StepName.field}} for filter values.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  DELETE_SHEET_RECORD: {
    configSchema: "sheet/table identifier, record/row identifier or filter.",
    instructions: "Identify the row to delete. Use {{StepName.field}} if needed.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  END_NODE_V3: {
    configSchema: "Optional: output or response shape. Often minimal.",
    instructions: "End node may have optional output configuration. Use workflow goal to set any response fields.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  START_NODE_V2: {
    configSchema: "Optional: trigger or input config. Often minimal.",
    instructions: "Start node is the entry; config is usually minimal. Set any expected input shape if needed.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  TRIGGER_SETUP_V3: {
    isPlaceholder: true, // UI placeholder. Do not suggest in generate-flow. Use real trigger types (FORM_TRIGGER, CUSTOM_WEBHOOK, etc.).
    configSchema: "trigger type, schedule (for time-based), or webhook/config. Keys depend on trigger type.",
    instructions: "Configure the workflow trigger. For schedule use cron or interval; for webhook use URL/config. Do not invent if type unknown.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node (triggers not allowed on Form canvas)
  },
  WEBHOOK_V2: {
    configSchema: "Optional webhook path or config. Often minimal.",
    instructions: "Webhook trigger. Set path or config if the platform expects it; otherwise minimal.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node (triggers not allowed on Form canvas)
  },
  TIME_BASED_TRIGGER_V2: {
    configSchema: "schedule (cron expression or interval), timezone (optional).",
    instructions: "Set schedule from workflow goal (e.g. every day at 9am). Use valid cron or interval format.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node (triggers not allowed on Form canvas)
  },
  SHEET_TRIGGER_V2: {
    configSchema: "sheet identifier, trigger event (e.g. new row, update), optional filters.",
    instructions: "Configure which sheet and which events trigger the workflow. Use workflow goal to infer.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node (triggers not allowed on Form canvas)
  },
  HITL_V2: {
    configSchema: "prompt or question (string), options (optional), assignee (optional). Keys depend on platform.",
    instructions: "Human-in-the-loop step. Set the question or task for the human; use {{StepName.field}} for context.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  PERSON_ENRICHMENT_V2: {
    configSchema: "input field (e.g. email or name), output mapping. Keys depend on enrichment API.",
    instructions: "Enrich with person data. Use data at node to pick input field; map output. Use {{StepName.field}}.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  COMPANY_ENRICHMENT_V2: {
    configSchema: "input field (e.g. domain or company name), output mapping.",
    instructions: "Enrich with company data. Use {{StepName.field}} for input and output mapping.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  EMAIL_ENRICHMENT_V2: {
    configSchema: "input field (email), output mapping.",
    instructions: "Enrich with email data. Use {{StepName.field}} for input and output.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  MATCH_PATTERN: {
    configSchema: "pattern (string, regex or pattern), inputField (string), outputField (optional).",
    instructions: "Match or extract using a pattern. Use workflow goal to define pattern; {{StepName.field}} for input.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  FOR_EACH: {
    configSchema: "arraySource (string, path to array e.g. {{StepName.items}}), optional itemVariable name.",
    instructions: "Iterate over an array from a previous step. Use {{StepName.field}} for the array path.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  REPEAT: {
    configSchema: "count (number) or countSource (string like {{StepName.n}}), optional max.",
    instructions: "Repeat a fixed number of times. Use number or {{StepName.field}} for count.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  LOOP_UNTIL: {
    configSchema: "condition (expression or condition object). Loop runs until condition is true.",
    instructions: "Define the exit condition. Use {{StepName.field}} in the condition.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  ITERATOR_V2: {
    configSchema: "arraySource (string), optional itemKey. Similar to FOR_EACH.",
    instructions: "Iterate over an array. Use {{StepName.field}} for the array path.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  ARRAY_AGGREGATOR_V2: {
    configSchema: "aggregation mode (e.g. collect, concat), outputKey (optional), input path (optional).",
    instructions: "Aggregate results from a loop. Use workflow goal to set mode and output key.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  SKIP_V2: {
    configSchema: "Optional condition or count. Often minimal.",
    instructions: "Skip step. Minimal config unless the platform expects a condition.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  BREAK_V2: {
    configSchema: "Optional condition. Often minimal.",
    instructions: "Break out of loop. Minimal config unless condition is needed.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  TINY_SEARCH_V3: {
    configSchema: "query (string), index or source (optional), limit (optional). Keys depend on search service.",
    instructions: "Search node. Use workflow goal and {{StepName.field}} for the query.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  AGENT_SCOUT: {
    configSchema: "prompt or task (string), optional params. Keys depend on agent.",
    instructions: "Scout agent. Set task from workflow goal; use {{StepName.field}} for context.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  AGENT_SCOUT_V3: {
    configSchema: "prompt or task (string), optional params. Keys depend on agent.",
    instructions: "Scout agent. Set task from workflow goal; use {{StepName.field}} for context.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
  AGENT_COMPOSER_V3: {
    configSchema: "prompt or task (string), optional params.",
    instructions: "Composer agent. Set task from workflow goal; use {{StepName.field}} for context.",
    applicableCanvases: ["WC_CANVAS"], // Workflow-only node
  },
};

/** Default config for internal types not yet in the map (fallback). */
export const DEFAULT_INTERNAL_TYPE_CONFIG = {
  configSchema: "Return only the config keys that this node type accepts. Use dataAtNode and workflow goal to fill values. Use {{StepName.field}} for references.",
  instructions: "Infer the node's configuration from the data available at this node and the workflow goal. Do not invent required values that are missing; if critical info is missing, you will return needs_clarification later.",
};

/**
 * Get type config for an internal node type.
 * @param {string} nodeType
 * @returns {InternalTypeConfig}
 */
export function getInternalTypeConfig(nodeType) {
  return SETUP_INTERNAL_TYPES[nodeType] || DEFAULT_INTERNAL_TYPE_CONFIG;
}
