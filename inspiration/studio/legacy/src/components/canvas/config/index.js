//FLOW CONTROLS
// import IF_ELSE_NODE from "../extensions/if-else/constant";
import HTTP_NODE from "../extensions/http/constant";
import DELAY_NODE from "../extensions/delay/constant";
import TRANSFORMER_NODE from "../extensions/transformer/constant";
import TRANSFORMER_V2_NODE from "../extensions/transformer-v2/constant";
import FORMULA_FX_NODE from "../extensions/formula-fx/constant";
import ITERATOR_NODE from "../extensions/iterator/constant";
import ARRAY_AGGREGATOR_NODE from "../extensions/array-aggregator/constant";
import TINYGPT_NODE from "../extensions/tiny-gpt/constant";
// import TINYGPT_RESEARCHER_NODE from "../extensions/tiny-gpt-researcher/constant";
// import TINYGPT_WRITER_NODE from "../extensions/tiny-gpt-writer/constant";
// import TINY_ANALYZER_NODE from "../extensions/tiny-gpt-analyzer/constant";
// import TINYGPT_SUMMARIZER_NODE from "../extensions/tiny-gpt-summarizer/constant";
// import TINYGPT_TRANSLATOR_NODE from "../extensions/tiny-gpt-translator/constant";
// import TINYGPT_LEARNING_NODE from "../extensions/tiny-gpt-learning/constant";
// import TINYGPT_CONSULTANT_NODE from "../extensions/tiny-gpt-consultant/constant";
// import TINYGPT_CREATIVE_NODE from "../extensions/tiny-gpt-creative/constant";
import MATCH_PATTERN_NODE from "../extensions/text-parsers/match-pattern/constant";
import BREAK_NODE from "../extensions/break/constant";
import SKIP_NODE from "../extensions/skip/constant";

//DATABASE
import CREATE_RECORD_NODE, {
  MYSQL_CREATE_RECORD_NODE,
  POSTGRES_CREATE_RECORD_NODE,
} from "../extensions/crud-operations/create-record/constant";
import UPDATE_RECORD_NODE, {
  MYSQL_UPDATE_RECORD_NODE,
  POSTGRES_UPDATE_RECORD_NODE,
} from "../extensions/crud-operations/update-record/constant";
import DELETE_RECORD_NODE, {
  MYSQL_DELETE_RECORD_NODE,
  POSTGRES_DELETE_RECORD_NODE,
} from "../extensions/crud-operations/delete-record/constant";
import EXECUTE_QUERY_NODE from "../extensions/crud-operations/execute-query/constant";
import FIND_ALL_RECORD_NODE, {
  MYSQL_FIND_ALL_RECORD_NODE,
  POSTGRES_FIND_ALL_RECORD_NODE,
} from "../extensions/crud-operations/find-all/constant";
import FIND_ONE_RECORD_NODE, {
  MYSQL_FIND_ONE_RECORD_NODE,
  POSTGRES_FIND_ONE_RECORD_NODE,
} from "../extensions/crud-operations/find-one/constant";

//QUESTION
import { QUESTIONS_NODES } from "../extensions/question-setup/constants/questionNodes";

//TRIGGER
import START_NODE from "../extensions/start/constant";
import END_NODE from "../extensions/end/constant";
import WEBHOOK_NODE from "../extensions/webhook/constant";
import TIME_BASED_TRIGGER_NODE from "../extensions/time-based-trigger/constant";
import SHEET_TRIGGER_NODE from "../extensions/sheet/trigger/constant";

// SHEET
// import CREATE_SHEET_RECORD_NODE from "../extensions/sheet/create-record/constant";
// import FIND_ONE_SHEET_RECORD_NODE from "../extensions/sheet/find-one/constant";
// import UPDATE_SHEET_RECORD_NODE from "../extensions/sheet/update-record/constant";
// import FIND_ALL_SHEET_RECORD_NODE from "../extensions/sheet/find-all/constant";
import DELETE_SHEET_RECORD_NODE from "../extensions/sheet/delete-record/constant";
import FIND_ONE_SHEET_RECORD_NODE_V2 from "../extensions/sheet/find-one-v2/constant";
import FIND_ALL_SHEET_RECORD_NODE_V2 from "../extensions/sheet/find-all-v2/constant";
// DEPRECATED: agent-scout V1 removed - use agent-scout-v3 from main src
// import AGENT_SCOUT_NODE from "../extensions/agent/agent-scout/constant";
import AGENT_COMPOSER_NODE from "../extensions/agent/agent-composer/constant";
import UPDATE_SHEET_RECORD_NODE_V2 from "../extensions/sheet/update-record-v2/constant";
import CREATE_SHEET_RECORD_NODE_V2 from "../extensions/sheet/create-record-v2/constant";

//ENRICHMENT
import PERSON_ENRICHMENT_NODE from "../extensions/enrichment/person/constant";
import EMAIL_ENRICHMENT_NODE from "../extensions/enrichment/email/constant";
import COMPANY_ENRICHMENT_NODE from "../extensions/enrichment/company/constant";

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
import IF_ELSE_NODE_V2 from "../extensions/if-else-v2/constant";
import HITL_NODE from "../extensions/hitl/constant";
import AGENT_OUTPUT_NODE from "../extensions/agent-output/constant";
import JUMP_TO_NODE from "../extensions/jump-to/constant";
import END_NODE_V2 from "../extensions/end-v2/constants";
import TOOL_OUTPUT_NODE from "../extensions/tool-output/constant";
import AGENT_NODE from "../extensions/agent-node/constant";
import SEND_EMAIL_TO_YOURSELF_NODE from "../extensions/send-email-to-yourself/constant";
import TINY_SEARCH_NODE_V2 from "../extensions/tiny-search-v2/constant";

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

const MYSQL_DATABASE_CONFIG = {
  label: "MySQL",
  components: [
    MYSQL_CREATE_RECORD_NODE,
    MYSQL_UPDATE_RECORD_NODE,
    MYSQL_DELETE_RECORD_NODE,
    MYSQL_FIND_ONE_RECORD_NODE,
    MYSQL_FIND_ALL_RECORD_NODE,
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
  ],
};

const SHEET_CONFIG = {
  label: SHEET,
  components: [
    CREATE_SHEET_RECORD_NODE_V2,
    // CREATE_SHEET_RECORD_NODE,
    // FIND_ONE_SHEET_RECORD_NODE,
    UPDATE_SHEET_RECORD_NODE_V2,
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
    QUESTIONS_NODES[QuestionType.OPINION_SCALE],
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
    HTTP_NODE,
    TRANSFORMER_NODE,
    TRANSFORMER_V2_NODE,
    FORMULA_FX_NODE,
    IF_ELSE_NODE_V2,
    JUMP_TO_NODE,
  ],
};

const IO_CONFIG_WC = {
  label: IO,
  components: [END_NODE, END_NODE_V2],
};

const IO_CONFIG_TC = {
  label: IO,
  components: [TOOL_OUTPUT_NODE],
};

const IO_CONFIG_IC = {
  label: IO,
  components: [
    START_NODE,
    WEBHOOK_NODE,
    TIME_BASED_TRIGGER_NODE,
    SHEET_TRIGGER_NODE,
    END_NODE,
  ],
};

const FLOW_CONTROL_CONFIG_IC = {
  label: FLOW_CONTROLS,
  components: [
    HTTP_NODE,
    DELAY_NODE,
    TRANSFORMER_NODE,
    TRANSFORMER_V2_NODE,
    FORMULA_FX_NODE,
    IF_ELSE_NODE_V2,
  ],
};

const FLOW_CONTROL_CONFIG_WC = {
  label: FLOW_CONTROLS,
  components: [
    HTTP_NODE,
    DELAY_NODE,
    TRANSFORMER_NODE,
    TRANSFORMER_V2_NODE,
    FORMULA_FX_NODE,
    IF_ELSE_NODE_V2,
    HITL_NODE,
  ],
};
const LOOP_CONFIG = {
  label: LOOPS,
  components: [ITERATOR_NODE, ARRAY_AGGREGATOR_NODE, SKIP_NODE, BREAK_NODE],
};

const FLOW_CONTROL_CONFIG_CMS = {
  label: FLOW_CONTROLS,
  components: [
    HTTP_NODE,
    TRANSFORMER_NODE,
    TRANSFORMER_V2_NODE,
    FORMULA_FX_NODE,
    IF_ELSE_NODE_V2,
  ],
};

const FLOW_CONTROL_CONFIG_AGENT = {
  label: FLOW_CONTROLS,
  components: [
    HTTP_NODE,
    TRANSFORMER_NODE,
    TRANSFORMER_V2_NODE,
    FORMULA_FX_NODE,
    IF_ELSE_NODE_V2,
    AGENT_OUTPUT_NODE,
  ],
};

const AI_CONFIG = {
  label: AI,
  components: [
    TINYGPT_NODE,
    AGENT_NODE,
    // TINYGPT_RESEARCHER_NODE,
    // TINYGPT_WRITER_NODE,
    // TINY_ANALYZER_NODE,
    // TINYGPT_SUMMARIZER_NODE,
    // TINYGPT_TRANSLATOR_NODE,
    // TINYGPT_LEARNING_NODE,
    // TINYGPT_CONSULTANT_NODE,
    // TINYGPT_CREATIVE_NODE,
  ],
};

const AGENTS_CONFIG = {
  label: AGENTS,
  // DEPRECATED: AGENT_SCOUT_NODE removed - using V3 in main src
  components: [AGENT_COMPOSER_NODE, TINY_SEARCH_NODE_V2],
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
      ENRICHMENT_CONFIG,
    ];
  } else if (CANVAS_MODE() === CANVAS_MODES.INTEGRATION_CANVAS) {
    return [
      AI_CONFIG,
      IO_CONFIG_IC,
      FLOW_CONTROL_CONFIG_IC,
      LOOP_CONFIG,
      TEXT_PARSER_CONFIG,
      // MYSQL_DATABASE_CONFIG,
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
      // MYSQL_DATABASE_CONFIG,
      POSTGRESQL_DATABASE_CONFIG,
      // DATABASE_CONFIG,
    ];
  } else if (CANVAS_MODE() === CANVAS_MODES.AGENT_CANVAS) {
    return [
      FLOW_CONTROL_CONFIG_AGENT,
      TEXT_PARSER_CONFIG,
      SHEET_CONFIG,
      MYSQL_DATABASE_CONFIG,
      POSTGRESQL_DATABASE_CONFIG,
    ];
  } else if (CANVAS_MODE() === CANVAS_MODES.CMS_CANVAS) {
    return [
      FLOW_CONTROL_CONFIG_CMS,
      TEXT_PARSER_CONFIG,
      QUESTION_CONFIG_CMS,
      DATABASE_CONFIG,
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
