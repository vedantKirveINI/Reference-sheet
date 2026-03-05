//FLOW CONTROLS
// import IF_ELSE_NODE from "../extensions/if-else/constant";
import { HTTP_NODE, HTTP_NODE as HTTP_V5_NODE } from "../extensions/http/constants";
import DELAY_NODE from "../extensions/delay/constant";
import { DELAY_V2_NODE } from "../extensions/delay-v2/constants";
import { TRANSFORMER_NODE, TRANSFORMER_NODE as TRANSFORMER_V3_NODE } from "../extensions/transformer/constants";

// Alias for deprecated transformer v2 (points to current version)
const TRANSFORMER_V2_NODE = TRANSFORMER_NODE;
import FORMULA_FX_NODE from "../extensions/formula-fx/constant";
import ITERATOR_NODE from "../extensions/iterator/constant";
import { ITERATOR_V2_NODE } from "../extensions/iterator-v2/constants";
import ARRAY_AGGREGATOR_NODE from "../extensions/array-aggregator/constant";
import { ARRAY_AGGREGATOR_V2_NODE } from "../extensions/array-aggregator-v2/constants";
import { TINYGPT_NODE, TINYGPT_NODE as TINYGPT_V2_NODE } from "../extensions/tiny-gpt/constants";
import { TINYGPT_NODE as TINYGPT_V4_NODE } from "../extensions/tiny-gpt-v4";
import { GPT_ANALYZER_NODE } from "../extensions/gpt-analyzer";
import { GPT_SUMMARIZER_NODE } from "../extensions/gpt-summarizer";
import { GPT_TRANSLATOR_NODE } from "../extensions/gpt-translator";
import { GPT_CREATIVE_NODE } from "../extensions/gpt-creative";
import { GPT_LEARNING_NODE } from "../extensions/gpt-learning";
import { GPT_CONSULTANT_NODE } from "../extensions/gpt-consultant";
import MATCH_PATTERN_NODE from "../extensions/text-parsers/match-pattern/constant";
import BREAK_NODE from "../extensions/break/constant";
import { BREAK_V2_NODE } from "../extensions/break-v2/constants";
import { LOOP_START_NODE } from "../extensions/loop-start/constants";
import { LOOP_END_NODE } from "../extensions/loop-end/constants";
import { FOR_EACH_NODE } from "../extensions/for-each/constants";
import { REPEAT_NODE } from "../extensions/repeat/constants";
import { LOOP_UNTIL_NODE } from "../extensions/loop-until/constants";
import SKIP_NODE from "../extensions/skip/constant";
import { SKIP_V2_NODE } from "../extensions/skip-v2/constants";
import { LOG_V2_NODE } from "../extensions/log-v2/constants";
import { JUMP_TO_V2_NODE } from "../extensions/jump-to-v2/constants";

//DATABASE
import { CREATE_RECORD_V2_NODE as CREATE_RECORD_NODE } from "../extensions/crud-operations/create-record/constants";
import { UPDATE_RECORD_V2_NODE as UPDATE_RECORD_NODE } from "../extensions/crud-operations/update-record/constants";
import { DELETE_V2_NODE as DELETE_RECORD_NODE } from "../extensions/crud-operations/delete-record/constants";
import { EXECUTE_V2_NODE as EXECUTE_QUERY_NODE } from "../extensions/crud-operations/execute-query/constants";
import { FIND_ALL_V2_NODE as FIND_ALL_RECORD_NODE } from "../extensions/crud-operations/find-all/constants";
import { FIND_ONE_V2_NODE as FIND_ONE_RECORD_NODE } from "../extensions/crud-operations/find-one/constants";

//MYSQL DATABASE NODES
import { MYSQL_CREATE_RECORD_NODE } from "../extensions/crud-operations/create-record/constants";
import { MYSQL_UPDATE_RECORD_NODE } from "../extensions/crud-operations/update-record/constants";
import { MYSQL_DELETE_RECORD_NODE } from "../extensions/crud-operations/delete-record/constants";
import { MYSQL_FIND_ONE_RECORD_NODE } from "../extensions/crud-operations/find-one/constants";
import { MYSQL_FIND_ALL_RECORD_NODE } from "../extensions/crud-operations/find-all/constants";
import { MYSQL_EXECUTE_QUERY_NODE } from "../extensions/crud-operations/execute-query/constants";

//POSTGRESQL DATABASE NODES
import { POSTGRES_CREATE_RECORD_NODE } from "../extensions/crud-operations/create-record/constants";
import { POSTGRES_UPDATE_RECORD_NODE } from "../extensions/crud-operations/update-record/constants";
import { POSTGRES_DELETE_RECORD_NODE } from "../extensions/crud-operations/delete-record/constants";
import { POSTGRES_FIND_ONE_RECORD_NODE } from "../extensions/crud-operations/find-one/constants";
import { POSTGRES_FIND_ALL_RECORD_NODE } from "../extensions/crud-operations/find-all/constants";
import { POSTGRES_EXECUTE_QUERY_NODE } from "../extensions/crud-operations/execute-query/constants";

//QUESTION
import { QUESTIONS_NODES } from "../extensions/question-setup/constants/questionNodes";

//TRIGGER
import START_NODE from "../extensions/start/constant";
import WEBHOOK_NODE from "../extensions/webhook/constant";
import TIME_BASED_TRIGGER_NODE from "../extensions/time-based-trigger/constant";
import {
  SHEET_TRIGGER_NODE,
  DELETE_SHEET_RECORD_NODE,
  FIND_ONE_SHEET_RECORD_NODE,
  FIND_ALL_SHEET_RECORD_NODE,
  UPDATE_SHEET_RECORD_NODE,
  UPDATE_SHEET_RECORDS_NODE,
  CREATE_SHEET_RECORD_NODE,
} from "../extensions/sheet";
import { TRIGGER_SETUP_NODE } from "../extensions/trigger-setup/constants";

const FIND_ONE_SHEET_RECORD_NODE_V2 = FIND_ONE_SHEET_RECORD_NODE;
const FIND_ALL_SHEET_RECORD_NODE_V2 = FIND_ALL_SHEET_RECORD_NODE;
const UPDATE_SHEET_RECORD_NODE_V2 = UPDATE_SHEET_RECORD_NODE;
const CREATE_SHEET_RECORD_NODE_V2 = CREATE_SHEET_RECORD_NODE;

import { AGENT_SCOUT_V3_NODE } from "../extensions/agent/agent-scout-v3/constants";
import { AGENT_COMPOSER_V3_NODE } from "../extensions/agent/agent-composer-v3/constants";

//ENRICHMENT
import { PERSON_ENRICHMENT_V2_NODE as PERSON_ENRICHMENT_NODE } from "../extensions/enrichment/person/constants";
import { EMAIL_ENRICHMENT_V2_NODE as EMAIL_ENRICHMENT_NODE } from "../extensions/enrichment/email/constants";
import { COMPANY_ENRICHMENT_V2_NODE as COMPANY_ENRICHMENT_NODE } from "../extensions/enrichment/company/constants";

import TOOL_INPUT_NODE from "../extensions/tool-input/constant";

import {
  CANVAS_MODE,
  CANVAS_MODES,
  QuestionType,
  SidebarKey,
  localStorageConstants,
} from "../../../module/constants";

import { isFeatureExcluded } from "@oute/oute-ds.common.core.utils";

import AddSidebarComponent from "../../../module/search/index";
// import { IF_ELSE_NODE as IF_ELSE_V4_NODE } from "../extensions/if-else/constants";
import { IF_ELSE_NODE_V2 } from "../extensions/if-else-v2/constants";
import HITL_NODE from "../extensions/hitl/constant";
import { HITL_V2_NODE } from "../extensions/hitl-v2/constants";
import AGENT_OUTPUT_NODE from "../extensions/agent-output/constant";
import JUMP_TO_NODE from "../extensions/jump-to/constant";
import { END_NODE } from "../extensions/end-v3/constants";
import { START_NODE_V2 } from "../extensions/start-v2/constants";
import TOOL_OUTPUT_NODE from "../extensions/tool-output/constant";
import { AGENT_NODE_V3 } from "../extensions/agent-node-v3/constants";
import { SEND_EMAIL_TO_YOURSELF_V2_NODE as SEND_EMAIL_TO_YOURSELF_NODE } from "../extensions/send-email-to-yourself-v2/constants";
import { TINY_SEARCH_V3_NODE } from "../extensions/tiny-search-v3/constants";

export const FLOW_CONTROLS = "Flow Control";
export const DATABASE = "Database";
export const INTEGRATIONS = "Integrations";
export const MY_AGENTS = "My Agents";
export const QUESTIONS = "Question";
export const TEXT_PARSER = "Text Parser";
export const UTILS = "Utils";
export const SHEET = "Tiny Tables";
export const AI = "AI";
export const LOOPS = "Loops";
export const IO = "IO";
export const AGENTS = "Agents";
export const ENRICHMENT = "Enrichment";

const DATABASE_CONFIG = {
  label: DATABASE,
  components: [
    CREATE_RECORD_NODE,
    UPDATE_RECORD_NODE,
    DELETE_RECORD_NODE,
    EXECUTE_QUERY_NODE,
    FIND_ALL_RECORD_NODE,
    FIND_ONE_RECORD_NODE,
  ],
};

const TEXT_PARSER_CONFIG = {
  label: TEXT_PARSER,
  components: [MATCH_PATTERN_NODE],
};

const UTILS_CONFIG = {
  label: UTILS,
  components: [SEND_EMAIL_TO_YOURSELF_NODE],
};

// MySQL and PostgreSQL database nodes removed during cleanup
// const MYSQL_DATABASE_CONFIG = {
//   label: "MySQL",
//   components: [],
// };

// const POSTGRESQL_DATABASE_CONFIG = {
//   label: "PostgreSQL",
//   components: [],
// };

const SHEET_CONFIG = {
  label: SHEET,
  components: [
    CREATE_SHEET_RECORD_NODE_V2,
    // CREATE_SHEET_RECORD_NODE,
    // FIND_ONE_SHEET_RECORD_NODE,
    UPDATE_SHEET_RECORD_NODE_V2,
    UPDATE_SHEET_RECORDS_NODE,
    // UPDATE_SHEET_RECORD_NODE,
    // FIND_ALL_SHEET_RECORD_NODE,
    FIND_ALL_SHEET_RECORD_NODE_V2,
    FIND_ONE_SHEET_RECORD_NODE_V2,
    DELETE_SHEET_RECORD_NODE,
  ],
};

const ENRICHMENT_CONFIG = {
  label: ENRICHMENT,
  components: [
    PERSON_ENRICHMENT_NODE,
    EMAIL_ENRICHMENT_NODE,
    COMPANY_ENRICHMENT_NODE,
  ],
};

const QUESTION_CONFIG_DEV_MODE = [
  QUESTIONS_NODES[QuestionType.TEXT_PREVIEW],
  QUESTIONS_NODES[QuestionType.SIGNATURE],
  QUESTIONS_NODES[QuestionType.AUTOCOMPLETE],
  QUESTIONS_NODES[QuestionType.MULTI_QUESTION_PAGE],
  QUESTIONS_NODES[QuestionType.QUESTIONS_GRID],
  QUESTIONS_NODES[QuestionType.PICTURE],
  QUESTIONS_NODES[QuestionType.STRIPE_PAYMENT],
  QUESTIONS_NODES[QuestionType.TERMS_OF_USE],
];

const QUESTION_CONFIG_CMS_DEV_MODE = [
  QUESTIONS_NODES[QuestionType.QUESTION_REPEATER],
];

let devModeFromLocalstorage = localStorage.getItem(
  localStorageConstants.DEV_MODE
);

export const QUESTION_CONFIG_FC = {
  label: QUESTIONS,
  components: [
    QUESTIONS_NODES[QuestionType.LOADING],
    QUESTIONS_NODES[QuestionType.WELCOME],
    QUESTIONS_NODES[QuestionType.ENDING],
    QUESTIONS_NODES[QuestionType.QUOTE],
    QUESTIONS_NODES[QuestionType.SHORT_TEXT],
    QUESTIONS_NODES[QuestionType.LONG_TEXT],
    QUESTIONS_NODES[QuestionType.NUMBER],
    QUESTIONS_NODES[QuestionType.EMAIL],
    QUESTIONS_NODES[QuestionType.FILE_PICKER],
    QUESTIONS_NODES[QuestionType.PDF_VIEWER],
    QUESTIONS_NODES[QuestionType.DATE],
    QUESTIONS_NODES[QuestionType.TIME],
    QUESTIONS_NODES[QuestionType.YES_NO],
    QUESTIONS_NODES[QuestionType.DROP_DOWN],
    QUESTIONS_NODES[QuestionType.DROP_DOWN_STATIC],
    QUESTIONS_NODES[QuestionType.PHONE_NUMBER],
    QUESTIONS_NODES[QuestionType.MCQ],
    QUESTIONS_NODES[QuestionType.SCQ],
    QUESTIONS_NODES[QuestionType.CURRENCY],
    QUESTIONS_NODES[QuestionType.ADDRESS],
    QUESTIONS_NODES[QuestionType.RANKING],
    QUESTIONS_NODES[QuestionType.ZIP_CODE],
    QUESTIONS_NODES[QuestionType.RATING],
    // QUESTIONS_NODES[QuestionType.OPINION_SCALE],
    QUESTIONS_NODES[QuestionType.TERMS_OF_USE],
    ...(isFeatureExcluded && isFeatureExcluded(QuestionType.SLIDER)
      ? []
      : [QUESTIONS_NODES[QuestionType.SLIDER]]),
    ...(devModeFromLocalstorage ? QUESTION_CONFIG_DEV_MODE : []),
  ],
};

export const QUESTION_CONFIG_CMS = {
  label: QUESTIONS,
  components: [
    QUESTIONS_NODES[QuestionType.TEXT_PREVIEW],
    QUESTIONS_NODES[QuestionType.FILE_PICKER],
    QUESTIONS_NODES[QuestionType.YES_NO],
    QUESTIONS_NODES[QuestionType.DROP_DOWN],
    QUESTIONS_NODES[QuestionType.DROP_DOWN_STATIC],
    QUESTIONS_NODES[QuestionType.KEY_VALUE_TABLE],
    QUESTIONS_NODES[QuestionType.FORMULA_BAR],
    QUESTIONS_NODES[QuestionType.DATE],
    ...(devModeFromLocalstorage ? QUESTION_CONFIG_CMS_DEV_MODE : []),
  ],
};

const FLOW_CONTROL_CONFIG_FC = {
  label: FLOW_CONTROLS,
  components: [
    HTTP_V5_NODE,
    // { ...HTTP_NODE, name: "HTTP (deprecated)", deprecated: true },
    TRANSFORMER_V3_NODE,
    // { ...TRANSFORMER_NODE, name: "Transformer (deprecated)", deprecated: true },
    // { ...TRANSFORMER_V2_NODE, name: "Transformer V2 (deprecated)", deprecated: true },
    FORMULA_FX_NODE,
    // IF_ELSE_V4_NODE,
    IF_ELSE_NODE_V2,
    JUMP_TO_V2_NODE,
    // { ...JUMP_TO_NODE, name: "Jump To (deprecated)", deprecated: true },
    LOG_V2_NODE,
  ],
};

const IO_CONFIG_WC = {
  label: IO,
  components: [END_NODE],
};

const IO_CONFIG_TC = {
  label: IO,
  components: [TOOL_OUTPUT_NODE],
};

const IO_CONFIG_IC = {
  label: IO,
  components: [
    START_NODE_V2,
    // { ...START_NODE, name: "Start (deprecated)", deprecated: true },
    TRIGGER_SETUP_NODE,
    WEBHOOK_NODE,
    TIME_BASED_TRIGGER_NODE,
    SHEET_TRIGGER_NODE,
    END_NODE,
  ],
};

const FLOW_CONTROL_CONFIG_IC = {
  label: FLOW_CONTROLS,
  components: [
    HTTP_V5_NODE,
    // { ...HTTP_NODE, name: "HTTP (deprecated)", deprecated: true },
    DELAY_V2_NODE,
    // { ...DELAY_NODE, name: "Delay (deprecated)", deprecated: true },
    TRANSFORMER_V3_NODE,
    // { ...TRANSFORMER_NODE, name: "Transformer (deprecated)", deprecated: true },
    // { ...TRANSFORMER_V2_NODE, name: "Transformer V2 (deprecated)", deprecated: true },
    FORMULA_FX_NODE,
    // IF_ELSE_V4_NODE,
    IF_ELSE_NODE_V2,
    // JUMP_TO_V2_NODE,
    // { ...JUMP_TO_NODE, name: "Jump To (deprecated)", deprecated: true },
    LOG_V2_NODE,
  ],
};

const FLOW_CONTROL_CONFIG_WC = {
  label: FLOW_CONTROLS,
  components: [
    HTTP_V5_NODE,
    // { ...HTTP_NODE, name: "HTTP (deprecated)", deprecated: true },
    DELAY_V2_NODE,
    // { ...DELAY_NODE, name: "Delay (deprecated)", deprecated: true },
    TRANSFORMER_V3_NODE,
    // { ...TRANSFORMER_NODE, name: "Transformer (deprecated)", deprecated: true },
    // { ...TRANSFORMER_V2_NODE, name: "Transformer V2 (deprecated)", deprecated: true },
    // FORMULA_FX_NODE,
    // IF_ELSE_V4_NODE,
    IF_ELSE_NODE_V2,
    // JUMP_TO_V2_NODE,
    // { ...JUMP_TO_NODE, name: "Jump To (deprecated)", deprecated: true },
    LOG_V2_NODE,
    HITL_V2_NODE,
    // { ...HITL_NODE, name: "HITL (deprecated)", deprecated: true },
  ],
};
const LOOP_CONFIG = {
  label: LOOPS,
  components: [
    FOR_EACH_NODE,
    REPEAT_NODE,
    // LOOP_UNTIL_NODE,           // Commented out: not needed in command palette
    // ITERATOR_V2_NODE,          // Commented out: not needed in command palette
    // ARRAY_AGGREGATOR_V2_NODE,   // Commented out: not needed in command palette
    SKIP_V2_NODE,
    BREAK_V2_NODE,
  ],
};

const FLOW_CONTROL_CONFIG_CMS = {
  label: FLOW_CONTROLS,
  components: [
    HTTP_V5_NODE,
    // { ...HTTP_NODE, name: "HTTP (deprecated)", deprecated: true },
    TRANSFORMER_V3_NODE,
    // { ...TRANSFORMER_NODE, name: "Transformer (deprecated)", deprecated: true },
    // { ...TRANSFORMER_V2_NODE, name: "Transformer V2 (deprecated)", deprecated: true },
    // FORMULA_FX_NODE,
    // IF_ELSE_V4_NODE,
    IF_ELSE_NODE_V2,
    // JUMP_TO_V2_NODE,
    // { ...JUMP_TO_NODE, name: "Jump To (deprecated)", deprecated: true },
    LOG_V2_NODE,
  ],
};

const FLOW_CONTROL_CONFIG_AGENT = {
  label: FLOW_CONTROLS,
  components: [
    HTTP_V5_NODE,
    // { ...HTTP_NODE, name: "HTTP (deprecated)", deprecated: true },
    TRANSFORMER_V3_NODE,
    // { ...TRANSFORMER_NODE, name: "Transformer (deprecated)", deprecated: true },
    // { ...TRANSFORMER_V2_NODE, name: "Transformer V2 (deprecated)", deprecated: true },
    // FORMULA_FX_NODE,
    // IF_ELSE_V4_NODE,
    IF_ELSE_NODE_V2,
    // JUMP_TO_V2_NODE,
    // { ...JUMP_TO_NODE, name: "Jump To (deprecated)", deprecated: true },
    LOG_V2_NODE,
    AGENT_OUTPUT_NODE,
  ],
};

const AI_CONFIG = {
  label: AI,
  components: [
    TINYGPT_V4_NODE,
    // GPT_ANALYZER_NODE,
    // GPT_SUMMARIZER_NODE,
    // GPT_TRANSLATOR_NODE,
    // GPT_CREATIVE_NODE,
    // GPT_LEARNING_NODE,
    // GPT_CONSULTANT_NODE,
    // { ...TINYGPT_V2_NODE, name: "TinyGPT V2 (deprecated)", deprecated: true },
    // { ...TINYGPT_NODE, name: "TinyGPT (deprecated)", deprecated: true },
    AGENT_NODE_V3,
  ],
};

const AGENTS_CONFIG = {
  label: AGENTS,
  components: [AGENT_SCOUT_V3_NODE, AGENT_COMPOSER_V3_NODE, TINY_SEARCH_V3_NODE],
};

const MYSQL_DATABASE_CONFIG = {
  label: "MySQL",
  components: [
    MYSQL_CREATE_RECORD_NODE,
    MYSQL_UPDATE_RECORD_NODE,
    MYSQL_DELETE_RECORD_NODE,
    MYSQL_FIND_ONE_RECORD_NODE,
    MYSQL_FIND_ALL_RECORD_NODE,
    MYSQL_EXECUTE_QUERY_NODE,
  ],
};

const POSTGRESQL_DATABASE_CONFIG = {
  label: "PostgreSQL",
  components: [
    POSTGRES_CREATE_RECORD_NODE,
    POSTGRES_UPDATE_RECORD_NODE,
    POSTGRES_DELETE_RECORD_NODE,
    POSTGRES_FIND_ONE_RECORD_NODE,
    POSTGRES_FIND_ALL_RECORD_NODE,
    POSTGRES_EXECUTE_QUERY_NODE,
  ],
};

export const getMode = () => {
  return CANVAS_MODE();
};

export const getSearchConfig = () => {

  if (CANVAS_MODE() === CANVAS_MODES.WORKFLOW_CANVAS) {
    return [
      QUESTION_CONFIG_FC,
      FLOW_CONTROL_CONFIG_FC,
      // TEXT_PARSER_CONFIG,
      AI_CONFIG,
      SHEET_CONFIG,
      UTILS_CONFIG,
      // DATABASE_CONFIG,
      MYSQL_DATABASE_CONFIG,
      POSTGRESQL_DATABASE_CONFIG,
      ENRICHMENT_CONFIG,
    ];
  } else if (CANVAS_MODE() === CANVAS_MODES.INTEGRATION_CANVAS) {
    return [
      AI_CONFIG,
      IO_CONFIG_IC,
      FLOW_CONTROL_CONFIG_IC,
      LOOP_CONFIG,
      TEXT_PARSER_CONFIG,
      MYSQL_DATABASE_CONFIG,
      POSTGRESQL_DATABASE_CONFIG,
      DATABASE_CONFIG,
      SHEET_CONFIG,
    ];
  } else if (CANVAS_MODE() === CANVAS_MODES.WC_CANVAS) {
    return [
      AI_CONFIG,
      AGENTS_CONFIG,
      IO_CONFIG_WC,
      FLOW_CONTROL_CONFIG_WC,
      LOOP_CONFIG,
      TEXT_PARSER_CONFIG,
      SHEET_CONFIG,
      UTILS_CONFIG,
      ENRICHMENT_CONFIG,
      MYSQL_DATABASE_CONFIG,
      POSTGRESQL_DATABASE_CONFIG,
      // DATABASE_CONFIG,
    ];
  } else if (CANVAS_MODE() === CANVAS_MODES.AGENT_CANVAS) {
    return [
      FLOW_CONTROL_CONFIG_AGENT,
      TEXT_PARSER_CONFIG,
      SHEET_CONFIG,
      // MYSQL_DATABASE_CONFIG,
      // POSTGRESQL_DATABASE_CONFIG,
    ];
  } else if (CANVAS_MODE() === CANVAS_MODES.CMS_CANVAS) {
    return [
      FLOW_CONTROL_CONFIG_CMS,
      TEXT_PARSER_CONFIG,
      QUESTION_CONFIG_CMS,
      DATABASE_CONFIG,
      MYSQL_DATABASE_CONFIG,
      POSTGRESQL_DATABASE_CONFIG,
      SHEET_CONFIG,
    ];
  } else if (CANVAS_MODE() === CANVAS_MODES.TOOL_CANVAS) {
    return [
      AI_CONFIG,
      AGENTS_CONFIG,
      IO_CONFIG_TC,
      FLOW_CONTROL_CONFIG_CMS,
      TEXT_PARSER_CONFIG,
      SHEET_CONFIG,
      UTILS_CONFIG,
      ENRICHMENT_CONFIG,
    ];
  }
};

export const ADD_SIDEBAR_COMPONENT = {
  title: "Add Node",
  key: SidebarKey.ADD_NODE,
  icon: "OUTEAddIcon",
  component: AddSidebarComponent,
  componentProps: {
    tabData: getSearchConfig(),
  },
};

export const JUMP_TO_NODE_COMPONENT = {
  title: "Jump To Node",
  icon: "OUTEJumpToIcon",
  key: "jump-to-node",
  disabled: true,
};

export const GLOBAL_PARAMS_COMPONENT = {
  title: "Global Params",
  icon: "OUTEGlobeIcon",
  key: "global-params",
  disabled: true,
};

export const INTEGRATION_COMPONENT = {
  title: "Integration",
  icon: "OUTEIntegrationIcon",
  key: "integration",
  disabled: true,
};

export const HELP_COMPONENT = {
  title: "Help",
  icon: "OUTEHelpIcon",
  key: "help",
  disabled: true,
};
