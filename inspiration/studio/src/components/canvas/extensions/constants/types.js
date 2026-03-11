export const IF_ELSE_TYPE = "If Else";
export const IF_ELSE_TYPE_V2 = "IFELSE_V2";
export const HTTP_TYPE = "HTTP";
/** SDK-compatible type; use this for all Delay nodes (Delay V2 is the only supported version). */
export const DELAY_TYPE = "Delay";
/** @deprecated Old canvas data may still have this; render as Delay V2. Will be removed (delay_deprecate). */
export const DELAY_TYPE_V2 = "DELAY_V2";
export const SUCCESS_SETUP_TYPE = "Success Setup";
export const TRANSFORMER_TYPE = "Transformer";
export const TRANSFORMER_TYPE_V3 = "TRANSFORMER_V3";
export const FORMULA_FX_TYPE = "FORMULA_FX";
export const INTEGRATION_TYPE = "Integration";
export const AGENT_WORKFLOW = "AGENT_WORKFLOW";
export const AGENT_OUTPUT = "AGENT_OUTPUT";
export const AGENT_INPUT = "AGENT_INPUT";
export const AGENT_INPUT_V2_TYPE = "AGENT_INPUT_V2";
export const AGENT_OUTPUT_V2_TYPE = "AGENT_OUTPUT_V2";
export const ITERATOR_TYPE = "Iterator";
export const ITERATOR_TYPE_V2 = "ITERATOR_V2";
export const ARRAY_AGGREGATOR_TYPE = "Array Aggregator";
export const ARRAY_AGGREGATOR_TYPE_V2 = "ARRAY_AGGREGATOR_V2";
export const LOG_TYPE = "LOG";
export const LOG_TYPE_V2 = "LOG_V2";
export const JUMP_TO_TYPE = "JUMP_TO";
export const JUMP_TO_TYPE_V2 = JUMP_TO_TYPE;
export const TOOL_INPUT_TYPE = "TOOL_INPUT";
export const TOOL_OUTPUT_TYPE = "TOOL_OUTPUT";
export const TOOL_INPUT_V2_TYPE = "TOOL_INPUT_V2";
export const TOOL_OUTPUT_V2_TYPE = "TOOL_OUTPUT_V2";
export const TINY_SEARCH = "TINY_SEARCH";
export const TINY_SEARCH_V2 = "TINY_SEARCH_V2";
export const TINY_SEARCH_V3 = "TINY_SEARCH_V3";

//Triggers
export const INPUT_SETUP_TYPE = "Input Setup";
export const WEBHOOK_TYPE = "CUSTOM_WEBHOOK";
export const WEBHOOK_TYPE_V2 = "WEBHOOK_V2";
export const TIME_BASED_TRIGGER = "TIME_BASED_TRIGGER";
export const TIME_BASED_TRIGGER_V2_TYPE = "TIME_BASED_TRIGGER_V2";
export const SHEET_TRIGGER = "SHEET_TRIGGER";
export const SHEET_TRIGGER_V2_TYPE = "SHEET_TRIGGER_V2";
export const SHEET_DATE_FIELD_TRIGGER = "SHEET_DATE_FIELD_TRIGGER";
export const FORM_TRIGGER = "FORM_TRIGGER";
export const TRIGGER_SETUP_TYPE = "TRIGGER_SETUP";
export const TRIGGER_SETUP_V3_TYPE = TRIGGER_SETUP_TYPE;

// GPT Nodes
export const TINY_GPT_TYPE = "GPT";
export const TINY_GPT_RESEARCHER_TYPE = "GPT_RESEARCHER";
export const TINY_GPT_WRITER_TYPE = "GPT_WRITER";
export const TINY_GPT_ANALYZER_TYPE = "GPT_ANALYZER";
export const TINY_GPT_CREATIVE_TYPE = "GPT_CREATIVE";
export const TINY_GPT_SUMMARIZER_TYPE = "GPT_SUMMARIZER";
export const TINY_GPT_TRANSLATOR_TYPE = "GPT_TRANSLATOR";
export const TINY_GPT_LEARNING_TYPE = "GPT_LEARNING";
export const TINY_GPT_CONSULTANT_TYPE = "GPT_CONSULTANT";

export const SKIP_TYPE = "SKIP";
export const SKIP_TYPE_V2 = "SKIP_V2";
export const BREAK_TYPE = "BREAK";
export const BREAK_TYPE_V2 = "BREAK_V2";

// Loop Node Types
export const LOOP_START_TYPE = "LOOP_START";
export const LOOP_END_TYPE = "LOOP_END";
export const FOR_EACH_TYPE = "FOR_EACH";
export const REPEAT_TYPE = "REPEAT";
export const LOOP_UNTIL_TYPE = "LOOP_UNTIL";

//Database Node Types
export const CREATE_TYPE = "Create Record";
export const CREATE_RECORD_V2_TYPE = "CREATE_RECORD_V2";
export const READ_TYPE = "Read Record";
export const UPDATE_TYPE = "Update Record";
export const UPDATE_RECORD_V2_TYPE = "UPDATE_RECORD_V2";
export const DELETE_TYPE = "Delete Record";
export const DELETE_V2_TYPE = "DELETE_RECORD_V2";
export const EXECUTE_TYPE = "Execute Query";
export const EXECUTE_V2_TYPE = "EXECUTE_QUERY_V2";
export const FIND_ALL_TYPE = "DB_FIND_ALL";
export const FIND_ALL_V2_TYPE = "DB_FIND_ALL_V2";
export const FIND_ONE_TYPE = "DB_FIND_ONE";
export const FIND_ONE_V2_TYPE = "DB_FIND_ONE_V2";

// DEPRECATED: V1 Sheet Record Types (kept for backward compatibility)
export const CREATE_SHEET_RECORD_TYPE_DEPRECATED = "CREATE_SHEET_RECORD_DEPRECATED";
export const UPDATE_SHEET_RECORD_TYPE_DEPRECATED = "UPDATE_SHEET_RECORD_DEPRECATED";
export const DELETE_SHEET_RECORD_TYPE_DEPRECATED = "DELETE_SHEET_RECORD_DEPRECATED";
export const FIND_ALL_SHEET_RECORD_TYPE_DEPRECATED = "FIND_ALL_SHEET_RECORD_DEPRECATED";
export const FIND_ONE_SHEET_RECORD_TYPE_DEPRECATED = "FIND_ONE_SHEET_RECORD_DEPRECATED";

// DEPRECATED: V2 Sheet Record Types (kept for backward compatibility)
// String values must match original values for existing nodes to work
export const FIND_ONE_SHEET_RECORD_V2_TYPE_DEPRECATED = "FIND_ONE_SHEET_RECORD_V2";
export const FIND_ALL_SHEET_RECORD_V2_TYPE_DEPRECATED = "FIND_ALL_SHEET_RECORD_V2";
export const UPDATE_SHEET_RECORD_TYPE_V2_DEPRECATED = "UPDATE_SHEET_RECORD_V2";
export const CREATE_SHEET_RECORD_TYPE_V2_DEPRECATED = "CREATE_SHEET_RECORD_V2";

// Current Sheet Record Types (using V2 SDK functions for proper type handling)
export const CREATE_SHEET_RECORD_TYPE = "CREATE_SHEET_RECORD_V2";
// export const UPDATE_SHEET_RECORD_TYPE = "UPDATE_SHEET_RECORD_V2";
export const UPDATE_SHEET_RECORD_TYPE = "UPDATE_ONE_SHEET_RECORD";
export const UPDATE_SHEET_RECORDS_TYPE = "UPDATE_SHEET_RECORD_V2";
export const FIND_ALL_SHEET_RECORD_TYPE = "FIND_ALL_SHEET_RECORD_V2";
export const FIND_ONE_SHEET_RECORD_TYPE = "FIND_ONE_SHEET_RECORD_V2";
export const DELETE_SHEET_RECORD_TYPE = "DELETE_SHEET_RECORD";

// Legacy aliases for V3 types (point to base types for backward compatibility with imports)
export const CREATE_SHEET_RECORD_V3_TYPE = CREATE_SHEET_RECORD_TYPE;
export const UPDATE_SHEET_RECORD_V3_TYPE = UPDATE_SHEET_RECORD_TYPE;
export const FIND_ALL_SHEET_RECORD_V3_TYPE = FIND_ALL_SHEET_RECORD_TYPE;
export const FIND_ONE_SHEET_RECORD_V3_TYPE = FIND_ONE_SHEET_RECORD_TYPE;
export const DELETE_SHEET_RECORD_V3_TYPE = DELETE_SHEET_RECORD_TYPE;

// Text Parser Node Types
export const MATCH_PATTERN_TYPE = "MATCH_PATTERN";

//CMS setup Node Types
export const CONNECTION_SETUP_TYPE = "Connection Setup";
export const WORKFLOW_SETUP_TYPE = "Workflow Setup";

export const PLACEHOLDER_TYPE = "Placeholder";

export const AGENT_INPUT_TYPE = "AGENT_INPUT_OLD";

export const AGENT_TINY_SCOUT = "AGENT_SCOUT";

export const AGENT = "AGENT";

export const AGENT_TINY_COMPOSER = "AGENT_COMPOSER";
export const AGENT_TINY_COMPOSER_V2 = "AGENT_COMPOSER_V2";
export const AGENT_TINY_COMPOSER_V3 = "AGENT_COMPOSER_V3";

// Enrichment Node Types
export const PERSON_ENRICHMENT_TYPE = "PERSON_ENRICHMENT";
export const PERSON_ENRICHMENT_V2_TYPE = "PERSON_ENRICHMENT_V2";
export const COMPANY_ENRICHMENT_TYPE = "COMPANY_ENRICHMENT";
export const COMPANY_ENRICHMENT_V2_TYPE = "COMPANY_ENRICHMENT_V2";
export const EMAIL_ENRICHMENT_TYPE = "EMAIL_ENRICHMENT";
export const EMAIL_ENRICHMENT_V2_TYPE = "EMAIL_ENRICHMENT_V2";

export const DATA_TYPES = {
  INT_DEFAULT_TYPE: "INTEGER",
  BOOLEAN_DEFAULT_TYPE: "BOOLEAN",
  STRING_DEFAULT_TYPE: "STRING",
};

export const AGENT_TYPES = [
  INPUT_SETUP_TYPE,
  WEBHOOK_TYPE,
  TIME_BASED_TRIGGER,
  // ITERATOR_TYPE,
];

export const HITL_TYPE = "HITL";
export const HITL_V2_TYPE = "HITL_V2";

export const SEND_EMAIL_TO_YOURSELF_TYPE = "SELF_EMAIL";
export const SEND_EMAIL_TO_YOURSELF_V2_TYPE = "SELF_EMAIL";
export const CONNECTION_SETUP_V2_TYPE = "CONNECTION_SETUP_V2";

// Start/End Node Types
export const START_NODE_V2_TYPE = "START_NODE_V2";
/** End node type (legacy/backend). Same value as SUCCESS_SETUP_TYPE. */
export const END_NODE_TYPE = SUCCESS_SETUP_TYPE;
export const END_NODE_V3_TYPE = SUCCESS_SETUP_TYPE;

/**
 * @deprecated Use AGENT_WORKFLOW instead. This type is deprecated.
 * Existing AGENT_WORKFLOW_V3 nodes will be mapped to the V3 component via AGENT_WORKFLOW.
 */
export const AGENT_WORKFLOW_V3 = "AGENT_WORKFLOW_V3";
