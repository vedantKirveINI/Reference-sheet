/**
 * Node metadata mapper for Command palette and other consumers.
 * Key = node type (string value of type on node), value = { description }.
 * Single source of truth for node-type descriptions; do not duplicate in node constants.
 */

import {
  IF_ELSE_TYPE,
  IF_ELSE_TYPE_V2,
  HTTP_TYPE,
  DELAY_TYPE,
  DELAY_TYPE_V2,
  SUCCESS_SETUP_TYPE,
  TRANSFORMER_TYPE,
  TRANSFORMER_TYPE_V3,
  ITERATOR_TYPE,
  ARRAY_AGGREGATOR_TYPE,
  LOG_TYPE,
  LOG_TYPE_V2,
  JUMP_TO_TYPE,
  JUMP_TO_TYPE_V2,
  TOOL_INPUT_TYPE,
  TOOL_OUTPUT_TYPE,
  TINY_SEARCH,
  TINY_SEARCH_V2,
  TINY_SEARCH_V3,
  INPUT_SETUP_TYPE,
  WEBHOOK_TYPE,
  TIME_BASED_TRIGGER,
  SHEET_TRIGGER,
  TRIGGER_SETUP_TYPE,
  TINY_GPT_TYPE,
  TINY_GPT_RESEARCHER_TYPE,
  TINY_GPT_WRITER_TYPE,
  TINY_GPT_ANALYZER_TYPE,
  TINY_GPT_CREATIVE_TYPE,
  TINY_GPT_SUMMARIZER_TYPE,
  TINY_GPT_TRANSLATOR_TYPE,
  TINY_GPT_LEARNING_TYPE,
  TINY_GPT_CONSULTANT_TYPE,
  SKIP_TYPE,
  SKIP_TYPE_V2,
  BREAK_TYPE,
  BREAK_TYPE_V2,
  LOOP_START_TYPE,
  LOOP_END_TYPE,
  FOR_EACH_TYPE,
  REPEAT_TYPE,
  LOOP_UNTIL_TYPE,
  CREATE_TYPE,
  UPDATE_TYPE,
  DELETE_TYPE,
  EXECUTE_TYPE,
  FIND_ALL_TYPE,
  FIND_ONE_TYPE,
  CREATE_SHEET_RECORD_TYPE,
  UPDATE_SHEET_RECORD_TYPE,
  UPDATE_SHEET_RECORDS_TYPE,
  FIND_ALL_SHEET_RECORD_TYPE,
  FIND_ONE_SHEET_RECORD_TYPE,
  DELETE_SHEET_RECORD_TYPE,
  MATCH_PATTERN_TYPE,
  FORMULA_FX_TYPE,
  CONNECTION_SETUP_TYPE,
  WORKFLOW_SETUP_TYPE,
  AGENT_INPUT,
  AGENT_TINY_SCOUT,
  AGENT_TINY_COMPOSER,
  AGENT_TINY_COMPOSER_V3,
  AGENT_WORKFLOW,
  PERSON_ENRICHMENT_TYPE,
  EMAIL_ENRICHMENT_TYPE,
  COMPANY_ENRICHMENT_TYPE,
  HITL_TYPE,
  HITL_V2_TYPE,
  SEND_EMAIL_TO_YOURSELF_V2_TYPE,
  START_NODE_V2_TYPE,
  END_NODE_TYPE,
} from "./types";

import { QuestionType } from "../../../../module/constants";

export const NODE_METADATA = {
  // If-Else
  [IF_ELSE_TYPE]: { description: "Split your flow based on a yes/no condition" },
  [IF_ELSE_TYPE_V2]: {
    description: "Branch workflow based on conditions and route to different steps.",
  },

  // HTTP
  [HTTP_TYPE]: { description: "Make HTTP requests to external APIs" },

  // Delay
  [DELAY_TYPE]: { description: "Delay" },
  [DELAY_TYPE_V2]: { description: "Pause workflow execution" },

  // End / Success
  [SUCCESS_SETUP_TYPE]: { description: "Define workflow completion" },
  [END_NODE_TYPE]: { description: "Define workflow completion" },

  // Transformer
  [TRANSFORMER_TYPE]: { description: "Transform and reshape your data using formulas" },
  [TRANSFORMER_TYPE_V3]: { description: "Transform and reshape your data using formulas" },

  // Iterator / Loops
  [ITERATOR_TYPE]: { description: "" },
  [ARRAY_AGGREGATOR_TYPE]: { description: "" },
  [LOOP_START_TYPE]: {
    description:
      "Repeat steps for each item in a list, a set number of times, or until a condition is met. Adds a start and end point to your canvas.",
  },
  [LOOP_END_TYPE]: { description: "Collects results from each round of the loop" },
  [FOR_EACH_TYPE]: { description: "Loop through each item in a list one by one" },
  [REPEAT_TYPE]: { description: "Loop a set number of times" },
  [LOOP_UNTIL_TYPE]: { description: "Keep looping until a condition is met" },

  // Log / Skip / Break
  [LOG_TYPE]: { description: "" },
  [LOG_TYPE_V2]: { description: "Output values for debugging" },
  [SKIP_TYPE]: { description: "" },
  [SKIP_TYPE_V2]: { description: "Skip to next iteration" },
  [BREAK_TYPE]: { description: "" },
  [BREAK_TYPE_V2]: { description: "Exit the current loop early when a condition is met" },

  // Jump To
  [JUMP_TO_TYPE]: { description: "Jump to another node in the workflow" },
  [JUMP_TO_TYPE_V2]: { description: "Jump to another node in your workflow" },

  // Tool IO
  [TOOL_INPUT_TYPE]: { description: "" },
  [TOOL_OUTPUT_TYPE]: { description: "" },

  // Triggers
  [INPUT_SETUP_TYPE]: { description: "" },
  [WEBHOOK_TYPE]: { description: "" },
  [TIME_BASED_TRIGGER]: { description: "" },
  [START_NODE_V2_TYPE]: { description: "Define workflow entry point" },
  [TRIGGER_SETUP_TYPE]: { description: "Choose and configure how your workflow starts" },
  [SHEET_TRIGGER]: { description: "Start workflow when sheet changes" },

  // AI / GPT
  [TINY_GPT_TYPE]: { description: "The most flexible AI node for any task" },
  [TINY_GPT_RESEARCHER_TYPE]: { description: "The most flexible AI node for any task" },
  [TINY_GPT_WRITER_TYPE]: { description: "The most flexible AI node for any task" },
  [TINY_GPT_ANALYZER_TYPE]: { description: "The most flexible AI node for any task" },
  [TINY_GPT_CREATIVE_TYPE]: { description: "The most flexible AI node for any task" },
  [TINY_GPT_SUMMARIZER_TYPE]: { description: "The most flexible AI node for any task" },
  [TINY_GPT_TRANSLATOR_TYPE]: { description: "The most flexible AI node for any task" },
  [TINY_GPT_LEARNING_TYPE]: { description: "The most flexible AI node for any task" },
  [TINY_GPT_CONSULTANT_TYPE]: { description: "The most flexible AI node for any task" },

  [TINY_SEARCH]: { description: "" },
  [TINY_SEARCH_V2]: { description: "AI-powered web search" },
  [TINY_SEARCH_V3]: { description: "AI-powered web search" },

  // Database CRUD
  [CREATE_TYPE]: { description: "Insert a new record into a database table" },
  [UPDATE_TYPE]: { description: "Update existing database records" },
  [DELETE_TYPE]: { description: "Remove records from database" },
  [EXECUTE_TYPE]: { description: "Run custom SQL queries" },
  [FIND_ALL_TYPE]: { description: "Query multiple records from database" },
  [FIND_ONE_TYPE]: { description: "Get a single record from database" },

  // Sheet
  [CREATE_SHEET_RECORD_TYPE]: { description: "Add a new row to a sheet" },
  [UPDATE_SHEET_RECORD_TYPE]: { description: "Modify an existing row in a sheet" },
  [UPDATE_SHEET_RECORDS_TYPE]: {
    description: "Update multiple rows matching conditions",
  },
  [FIND_ALL_SHEET_RECORD_TYPE]: { description: "Query multiple rows from a sheet" },
  [FIND_ONE_SHEET_RECORD_TYPE]: { description: "Get a single matching row from a sheet" },
  [DELETE_SHEET_RECORD_TYPE]: { description: "Remove rows from a sheet" },

  // Text Parser
  [MATCH_PATTERN_TYPE]: { description: "" },
  [FORMULA_FX_TYPE]: {
    description: "AI-powered formula editor with natural language support",
  },

  // Setup
  [CONNECTION_SETUP_TYPE]: { description: "" },
  [WORKFLOW_SETUP_TYPE]: { description: "" },

  // Agents
  [AGENT_INPUT]: { description: "" },
  [AGENT_TINY_SCOUT]: { description: "AI-powered prospect research" },
  [AGENT_TINY_COMPOSER]: { description: "Build personalized messages and emails" },
  [AGENT_TINY_COMPOSER_V3]: { description: "AI-powered message composition" },
  [AGENT_WORKFLOW]: { description: "Run an AI agent to process messages" },

  // Enrichment
  [PERSON_ENRICHMENT_TYPE]: {
    description: "Get information about a person using name and company domain",
  },
  [EMAIL_ENRICHMENT_TYPE]: {
    description: "Find email addresses using name and company domain",
  },
  [COMPANY_ENRICHMENT_TYPE]: {
    description: "Get company data using domain identifier",
  },

  // HITL / Utils
  [HITL_TYPE]: { description: "Pause workflow for human input or approval" },
  [HITL_V2_TYPE]: { description: "Pause workflow for human input or approval" },
  [SEND_EMAIL_TO_YOURSELF_V2_TYPE]: {
    description: "Send quick notification emails to yourself",
  },

  // Question types (QuestionType enum values as keys)
  [QuestionType.MULTI_QUESTION_PAGE]: {
    description: "Group multiple questions on one page",
  },
  [QuestionType.AUTOCOMPLETE]: {
    description: "Search and select from suggestions",
  },
  [QuestionType.QUESTIONS_GRID]: {
    description: "Ask questions in a grid layout",
  },
  [QuestionType.LOADING]: { description: "Show a loading state" },
  [QuestionType.WELCOME]: {
    description: "Show a welcome screen before questions",
  },
  [QuestionType.ENDING]: {
    description: "Show a thank-you or ending screen",
  },
  [QuestionType.QUOTE]: { description: "Display a quote or testimonial" },
  [QuestionType.ADDRESS]: { description: "Collect a full mailing address" },
  [QuestionType.TEXT_PREVIEW]: {
    description: "Display read-only text or instructions",
  },
  [QuestionType.SHORT_TEXT]: { description: "Collect a short text answer" },
  [QuestionType.LONG_TEXT]: {
    description: "Collect a longer, detailed response",
  },
  [QuestionType.MCQ]: { description: "Let people pick multiple options" },
  [QuestionType.PICTURE]: { description: "Upload or choose an image" },
  [QuestionType.QUESTION_REPEATER]: {
    description: "Let users repeat a set of questions",
  },
  [QuestionType.SCQ]: { description: "Let people pick one option" },
  [QuestionType.YES_NO]: { description: "Ask a simple yes or no question" },
  [QuestionType.DROP_DOWN]: { description: "Pick from a dropdown list" },
  [QuestionType.DROP_DOWN_STATIC]: { description: "Pick from a dropdown list" },
  [QuestionType.PHONE_NUMBER]: { description: "Ask for a phone number" },
  [QuestionType.ZIP_CODE]: { description: "Collect a postal or zip code" },
  [QuestionType.RANKING]: {
    description: "Ask users to rank items in order",
  },
  [QuestionType.EMAIL]: { description: "Ask for an email address" },
  [QuestionType.SIGNATURE]: { description: "Collect a digital signature" },
  [QuestionType.DATE]: { description: "Ask for a date" },
  [QuestionType.TIME]: { description: "Pick a time" },
  [QuestionType.CURRENCY]: { description: "Ask for a currency amount" },
  [QuestionType.NUMBER]: { description: "Ask for a number" },
  [QuestionType.FILE_PICKER]: { description: "Let users upload a file" },
  [QuestionType.PDF_VIEWER]: { description: "Display a PDF document" },
  [QuestionType.CONNECTION]: {
    description: "Connect to an external service",
  },
  [QuestionType.FORMULA_BAR]: {
    description: "Calculate a value using a formula",
  },
  [QuestionType.KEY_VALUE_TABLE]: {
    description: "Display data in a table format",
  },
  [QuestionType.COLLECT_PAYMENT]: { description: "Accept a payment" },
  [QuestionType.RATING]: {
    description: "Collect a star or number rating",
  },
  [QuestionType.OPINION_SCALE]: { description: "Rate on a numeric scale" },
  [QuestionType.SLIDER]: {
    description: "Choose a value on a sliding scale",
  },
  [QuestionType.STRIPE_PAYMENT]: {
    description: "Accept a payment via Stripe",
  },
  [QuestionType.TERMS_OF_USE]: {
    description: "Show terms and ask for agreement",
  },
};

/**
 * Get metadata for a node type.
 * @param {string} nodeType - The type string on the node (e.g. "HTTP", "IFELSE_V2")
 * @returns {{ description?: string }} Metadata object; empty object if not found.
 */
export function getNodeMetadata(nodeType) {
  return NODE_METADATA[nodeType] || {};
}

/**
 * Get description text for a node type.
 * @param {string} nodeType - The type string on the node
 * @returns {string} Description string or empty string if not found.
 */
export function getNodeDescriptionText(nodeType) {
  return getNodeMetadata(nodeType).description ?? "";
}
