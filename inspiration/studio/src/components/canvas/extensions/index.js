import { QUESTIONS_NODES } from "./question-setup/constants/questionNodes";
import { extractTextContentFromLexicalString } from "./question-setup/utils";
export * as QUESTIONS_NODES from "./question-setup/constants/questionNodes";
export * as DEFAULT_QUESTION_CONFIG from "./question-setup/constants/default-question-config";
export { MODES as INTEGRATION_NODE_MODES } from "./integration-node/constant/constants";
import CommonTestModule from "./common-components/CommonTestModule";
export { CommonTestModule };
import WORKFLOW_SETUP_NODE from "./workflow-setup/constant";
import {
  AGENT_INPUT_TYPE,
  AGENT_TINY_COMPOSER,
  AGENT_TINY_SCOUT,
  ARRAY_AGGREGATOR_TYPE,
  BREAK_TYPE,
  CONNECTION_SETUP_TYPE,
  CREATE_SHEET_RECORD_TYPE,
  CREATE_TYPE,
  DELAY_TYPE,
  DELETE_SHEET_RECORD_TYPE,
  DELETE_TYPE,
  EXECUTE_TYPE,
  FIND_ALL_SHEET_RECORD_TYPE,
  FIND_ALL_TYPE,
  FIND_ONE_SHEET_RECORD_TYPE,
  FIND_ONE_TYPE,
  HTTP_TYPE,
  IF_ELSE_TYPE,
  IF_ELSE_TYPE_V2,
  INPUT_SETUP_TYPE,
  ITERATOR_TYPE,
  LOG_TYPE,
  MATCH_PATTERN_TYPE,
  SHEET_TRIGGER,
  SKIP_TYPE,
  SUCCESS_SETUP_TYPE,
  END_NODE_TYPE,
  TIME_BASED_TRIGGER,
  TINY_GPT_ANALYZER_TYPE,
  TINY_GPT_CONSULTANT_TYPE,
  TINY_GPT_CREATIVE_TYPE,
  TINY_GPT_LEARNING_TYPE,
  TINY_GPT_RESEARCHER_TYPE,
  TINY_GPT_SUMMARIZER_TYPE,
  TINY_GPT_TRANSLATOR_TYPE,
  TINY_GPT_TYPE,
  TINY_GPT_WRITER_TYPE,
  TRANSFORMER_TYPE,
  UPDATE_SHEET_RECORD_TYPE,
  UPDATE_TYPE,
  WEBHOOK_TYPE,
  WORKFLOW_SETUP_TYPE,
  AGENT_INPUT,
  JUMP_TO_TYPE,
  TRIGGER_SETUP_TYPE,
  TOOL_INPUT_TYPE,
  TOOL_OUTPUT_TYPE,
  TINY_SEARCH,
  TINY_SEARCH_V2,
  PERSON_ENRICHMENT_TYPE,
  EMAIL_ENRICHMENT_TYPE,
  COMPANY_ENRICHMENT_TYPE,
  HITL_TYPE,
} from "./constants/types";
import { HTTP_NODE } from "./http/constants";
import WEBHOOK_NODE from "./webhook/constant";
import { TRANSFORMER_NODE } from "./transformer/constants";
import TINYGPT_WRITER_NODE from "./tiny-gpt-writer/constant";
import { TINYGPT_TRANSLATOR_V2_NODE as TINYGPT_TRANSLATOR_NODE } from "./tiny-gpt-translator/constants";
import { TINYGPT_SUMMARIZER_V2_NODE as TINYGPT_SUMMARIZER_NODE } from "./tiny-gpt-summarizer/constants";
import TINYGPT_RESEARCHER_NODE from "./tiny-gpt-researcher/constant";
import { TINYGPT_LEARNING_V2_NODE as TINYGPT_LEARNING_NODE } from "./tiny-gpt-learning/constants";
import { TINYGPT_CREATIVE_V2_NODE as TINYGPT_CREATIVE_NODE } from "./tiny-gpt-creative/constants";
import { TINYGPT_CONSULTANT_V2_NODE as TINYGPT_CONSULTANT_NODE } from "./tiny-gpt-consultant/constants";
import { TINYGPT_ANALYZER_V2_NODE as TINYGPT_ANALYZER_NODE } from "./tiny-gpt-analyzer/constants";
import { TINYGPT_NODE } from "./tiny-gpt/constants";
import TIME_BASED_TRIGGER_NODE from "./time-based-trigger/constant";
import MATCH_PATTERN_NODE from "./text-parsers/match-pattern/constant";
import START_NODE from "./start/constant";
import SKIP_NODE from "./skip/constant";
import LOG_NODE from "./log/constant";
import ITERATOR_NODE from "./iterator/constant";
import { IF_ELSE_NODE } from "./if-else/constants";
import { IF_ELSE_NODE_V2 } from "./if-else-v2/constants";
import { END_NODE } from "./end-v3/constants";
import DELAY_NODE from "./delay/constant";
import CONNECTION_SETUP_NODE from "./connection-setup/constant";
import BREAK_NODE from "./break/constant";
import ARRAY_AGGREGATOR_NODE from "./array-aggregator/constant";
import AGENT_COMPOSER_NODE from "./agent/agent-composer/constant";
import { AGENT_SCOUT_V3_NODE as AGENT_SCOUT_NODE } from "./agent/agent-scout-v3/constants";
import AGENT_INPUT_NODE from "./agent/input/constant";
import { CREATE_RECORD_V2_NODE as CREATE_RECORD_NODE } from "./crud-operations/create-record/constants";
import { DELETE_V2_NODE as DELETE_RECORD_NODE } from "./crud-operations/delete-record/constants";
import { EXECUTE_V2_NODE as EXECUTE_QUERY_NODE } from "./crud-operations/execute-query/constants";
import { FIND_ALL_V2_NODE as FIND_ALL_RECORD_NODE } from "./crud-operations/find-all/constants";
import { FIND_ONE_V2_NODE as FIND_ONE_RECORD_NODE } from "./crud-operations/find-one/constants";
import { UPDATE_RECORD_V2_NODE as UPDATE_RECORD_NODE } from "./crud-operations/update-record/constants";
import {
  CREATE_SHEET_RECORD_NODE,
  DELETE_SHEET_RECORD_NODE,
  FIND_ALL_SHEET_RECORD_NODE,
  FIND_ONE_SHEET_RECORD_NODE,
  SHEET_TRIGGER_NODE,
  UPDATE_SHEET_RECORD_NODE,
} from "./sheet";
import { BaseIntegrationNode } from "./integration-node/base-integration-node";
import JUMP_TO_NODE from "./jump-to/constant";
import { TRIGGER_SETUP_NODE, FORM_TRIGGER_NODE } from "./trigger-setup/constants";
import TOOL_INPUT_NODE from "./tool-input/constant";
import TOOL_OUTPUT_NODE from "./tool-output/constant";
import TINY_SEARCH_NODE from "./tiny-search/constant";
import TINY_SEARCH_NODE_V2 from "./tiny-search-v2/constant";
import { PERSON_ENRICHMENT_V2_NODE as PERSON_ENRICHMENT_NODE } from "./enrichment/person/constants";
import { EMAIL_ENRICHMENT_V2_NODE as EMAIL_ENRICHMENT_NODE } from "./enrichment/email/constants";
import { COMPANY_ENRICHMENT_V2_NODE as COMPANY_ENRICHMENT_NODE } from "./enrichment/company/constants";
import { HITL_V2_NODE } from "./hitl-v2/constants";
export {
  FORM_TRIGGER_NODE,
  TIME_BASED_TRIGGER_NODE,
  WEBHOOK_NODE,
  SHEET_TRIGGER_NODE,
};
export { BaseIntegrationNode };
export { default as DELAY_NODE } from "./delay/constant";
export { HTTP_NODE } from "./http/constants";
export { IF_ELSE_NODE } from "./if-else/constants";
export { IF_ELSE_NODE_V2 } from "./if-else-v2/constants";
export { getDefaultIfElseGoData } from "./if-else";
export { default as WORKFLOW_SETUP_NODE } from "./workflow-setup/constant";
export { default as START_NODE } from "./start/constant";
export { default as CONNECTION_SETUP_NODE } from "./connection-setup/constant";
export { default as AGENT_INPUT_NODE } from "./agent-input/constant";
export { TRIGGER_SETUP_NODE } from "./trigger-setup/constants";
export { default as TOOL_INPUT_NODE } from "./tool-input/constant";

export {
  IF_ELSE_TYPE,
  IF_ELSE_TYPE_V2,
  INTEGRATION_TYPE,
  AGENT_INPUT_TYPE,
  HTTP_TYPE,
  WORKFLOW_SETUP_TYPE,
  WEBHOOK_TYPE,
  TRANSFORMER_TYPE,
  TINY_GPT_WRITER_TYPE,
  TINY_GPT_TRANSLATOR_TYPE,
  TINY_GPT_SUMMARIZER_TYPE,
  TINY_GPT_RESEARCHER_TYPE,
  TINY_GPT_LEARNING_TYPE,
  TINY_GPT_CREATIVE_TYPE,
  TINY_GPT_CONSULTANT_TYPE,
  TINY_GPT_ANALYZER_TYPE,
  TINY_GPT_TYPE,
  TIME_BASED_TRIGGER,
  MATCH_PATTERN_TYPE,
  INPUT_SETUP_TYPE,
  SKIP_TYPE,
  HITL_TYPE,
  HITL_V2_TYPE,
  AGENT_WORKFLOW,
  AGENT_OUTPUT,
  AGENT_INPUT,
  TRIGGER_SETUP_TYPE,
  TOOL_INPUT_TYPE,
  TOOL_OUTPUT_TYPE,
  PERSON_ENRICHMENT_TYPE,
  EMAIL_ENRICHMENT_TYPE,
  COMPANY_ENRICHMENT_TYPE,
  DELETE_SHEET_RECORD_TYPE,
  FORM_TRIGGER,
  SHEET_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
} from "./constants/types";

const NODES_MAPPING = {
  [WORKFLOW_SETUP_TYPE]: WORKFLOW_SETUP_NODE,
  [WEBHOOK_TYPE]: WEBHOOK_NODE,
  [TRANSFORMER_TYPE]: TRANSFORMER_NODE,
  [TINY_GPT_WRITER_TYPE]: TINYGPT_WRITER_NODE,
  [TINY_GPT_TRANSLATOR_TYPE]: TINYGPT_TRANSLATOR_NODE,
  [TINY_GPT_SUMMARIZER_TYPE]: TINYGPT_SUMMARIZER_NODE,
  [TINY_GPT_RESEARCHER_TYPE]: TINYGPT_RESEARCHER_NODE,
  [TINY_GPT_LEARNING_TYPE]: TINYGPT_LEARNING_NODE,
  [TINY_GPT_CREATIVE_TYPE]: TINYGPT_CREATIVE_NODE,
  [TINY_GPT_CONSULTANT_TYPE]: TINYGPT_CONSULTANT_NODE,
  [TINY_GPT_ANALYZER_TYPE]: TINYGPT_ANALYZER_NODE,
  [TINY_GPT_TYPE]: TINYGPT_NODE,
  [TIME_BASED_TRIGGER]: TIME_BASED_TRIGGER_NODE,
  [MATCH_PATTERN_TYPE]: MATCH_PATTERN_NODE,
  [INPUT_SETUP_TYPE]: START_NODE,
  [SKIP_TYPE]: SKIP_NODE,
  [LOG_TYPE]: LOG_NODE,
  [ITERATOR_TYPE]: ITERATOR_NODE,
  [IF_ELSE_TYPE]: IF_ELSE_NODE,
  [IF_ELSE_TYPE_V2]: IF_ELSE_NODE_V2,
  [HTTP_TYPE]: HTTP_NODE,
  [SUCCESS_SETUP_TYPE]: END_NODE,
  [END_NODE_TYPE]: END_NODE,
  [DELAY_TYPE]: DELAY_NODE,
  [CONNECTION_SETUP_TYPE]: CONNECTION_SETUP_NODE,
  [BREAK_TYPE]: BREAK_NODE,
  [ARRAY_AGGREGATOR_TYPE]: ARRAY_AGGREGATOR_NODE,
  [AGENT_TINY_COMPOSER]: AGENT_COMPOSER_NODE,
  [AGENT_TINY_SCOUT]: AGENT_SCOUT_NODE,
  [CREATE_TYPE]: CREATE_RECORD_NODE,
  [DELETE_TYPE]: DELETE_RECORD_NODE,
  [EXECUTE_TYPE]: EXECUTE_QUERY_NODE,
  [FIND_ALL_TYPE]: FIND_ALL_RECORD_NODE,
  [FIND_ONE_TYPE]: FIND_ONE_RECORD_NODE,
  [UPDATE_TYPE]: UPDATE_RECORD_NODE,
  [CREATE_SHEET_RECORD_TYPE]: CREATE_SHEET_RECORD_NODE,
  [DELETE_SHEET_RECORD_TYPE]: DELETE_SHEET_RECORD_NODE,
  [FIND_ALL_SHEET_RECORD_TYPE]: FIND_ALL_SHEET_RECORD_NODE,
  [FIND_ONE_SHEET_RECORD_TYPE]: FIND_ONE_SHEET_RECORD_NODE,
  [SHEET_TRIGGER]: SHEET_TRIGGER_NODE,
  [UPDATE_SHEET_RECORD_TYPE]: UPDATE_SHEET_RECORD_NODE,
  [AGENT_INPUT]: AGENT_INPUT_NODE,
  [JUMP_TO_TYPE]: JUMP_TO_NODE,
  [TRIGGER_SETUP_TYPE]: TRIGGER_SETUP_NODE,
  [TOOL_INPUT_TYPE]: TOOL_INPUT_NODE,
  [TOOL_OUTPUT_TYPE]: TOOL_OUTPUT_NODE,
  [TINY_SEARCH]: TINY_SEARCH_NODE,
  [TINY_SEARCH_V2]: TINY_SEARCH_NODE_V2,
  [PERSON_ENRICHMENT_TYPE]: PERSON_ENRICHMENT_NODE,
  [EMAIL_ENRICHMENT_TYPE]: EMAIL_ENRICHMENT_NODE,
  [COMPANY_ENRICHMENT_TYPE]: COMPANY_ENRICHMENT_NODE,
  [HITL_TYPE]: HITL_V2_NODE,
  ...QUESTIONS_NODES,
};

const getNodeData = (nodeType) => {
  let nodeData = NODES_MAPPING[nodeType];
  try {
    nodeData = structuredClone(NODES_MAPPING[nodeType]);
  } catch (error) {}
  return nodeData;
};

// Export HTTP utilities - parseCurlCommand is the main cURL parsing function
export { parseCurlCommand, isCurlCommand } from "./http/utils";

export { convertFieldIdToName } from "./sheet/utils";
export { getNodeData, extractTextContentFromLexicalString };
export {
  getNodeMetadata,
  getNodeDescriptionText,
} from "./constants/nodeMetadataMap";
