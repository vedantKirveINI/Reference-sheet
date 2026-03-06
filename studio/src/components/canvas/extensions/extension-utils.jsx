import html2canvas from "html2canvas";
import ReactDOM from "react-dom/client";

import {
  localStorageConstants,
  QuestionType,
  ViewPort,
} from "../../../module/constants";
// import { QuestionCreator } from "@oute/oute-ds.skeleton.question-creator";

import assetSDKServices from "../services/assetSDKServices";
import { canvasSDKServices } from "../services/canvasSDKServices";
import { IF_ELSE_ERRORS } from "../utils/errorEnums";

import ARRAY_AGGREGATOR_NODE from "./array-aggregator/constant";
import CONNECTION_SETUP_NODE from "./connection-setup/constant";
import {
  ARRAY_AGGREGATOR_TYPE,
  CONNECTION_SETUP_TYPE,
  CREATE_SHEET_RECORD_TYPE,
  CREATE_TYPE,
  DELAY_TYPE,
  DELAY_TYPE_V2,
  DELETE_TYPE,
  EXECUTE_TYPE,
  FIND_ALL_TYPE,
  FIND_ONE_SHEET_RECORD_TYPE,
  FIND_ALL_SHEET_RECORD_TYPE,
  FIND_ONE_TYPE,
  HTTP_TYPE,
  IF_ELSE_TYPE,
  INPUT_SETUP_TYPE,
  INTEGRATION_TYPE,
  ITERATOR_TYPE,
  ITERATOR_TYPE_V2,
  LOG_TYPE,
  MATCH_PATTERN_TYPE,
  SUCCESS_SETUP_TYPE,
  TINY_GPT_TYPE,
  TRANSFORMER_TYPE,
  TRANSFORMER_TYPE_V3,
  UPDATE_TYPE,
  UPDATE_SHEET_RECORD_TYPE,
  WORKFLOW_SETUP_TYPE,
  TINY_GPT_RESEARCHER_TYPE,
  TINY_GPT_WRITER_TYPE,
  SKIP_TYPE,
  BREAK_TYPE,
  TINY_GPT_ANALYZER_TYPE,
  TINY_GPT_SUMMARIZER_TYPE,
  TINY_GPT_TRANSLATOR_TYPE,
  TINY_GPT_LEARNING_TYPE,
  TINY_GPT_CONSULTANT_TYPE,
  TINY_GPT_CREATIVE_TYPE,
  WEBHOOK_TYPE,
  IF_ELSE_TYPE_V2,
  TIME_BASED_TRIGGER,
  AGENT_TINY_SCOUT,
  AGENT_TINY_COMPOSER,
  SHEET_TRIGGER,
  HITL_TYPE,
  AGENT_WORKFLOW,
  AGENT_OUTPUT,
  AGENT_INPUT,
  JUMP_TO_TYPE,
  TRIGGER_SETUP_TYPE,
  TOOL_INPUT_TYPE,
  TOOL_OUTPUT_TYPE,
  SEND_EMAIL_TO_YOURSELF_TYPE,
  TINY_SEARCH,
  TINY_SEARCH_V2,
  FORM_TRIGGER,
  PERSON_ENRICHMENT_TYPE,
  PERSON_ENRICHMENT_V2_TYPE,
  EMAIL_ENRICHMENT_TYPE,
  EMAIL_ENRICHMENT_V2_TYPE,
  COMPANY_ENRICHMENT_TYPE,
  COMPANY_ENRICHMENT_V2_TYPE,
  CREATE_RECORD_V2_TYPE,
  UPDATE_RECORD_V2_TYPE,
  DELETE_V2_TYPE,
  FIND_ALL_V2_TYPE,
  FIND_ONE_V2_TYPE,
  EXECUTE_V2_TYPE,
  FOR_EACH_TYPE,
  REPEAT_TYPE,
  LOOP_UNTIL_TYPE,
  LOOP_END_TYPE,
  UPDATE_SHEET_RECORDS_TYPE,
  SHEET_DATE_FIELD_TRIGGER,
  END_NODE_TYPE,
} from "./constants/types";

import { CREATE_RECORD_V2_NODE as CREATE_RECORD_NODE } from "./crud-operations/create-record/constants";
import { DELETE_V2_NODE as DELETE_RECORD_NODE } from "./crud-operations/delete-record/constants";
import { EXECUTE_V2_NODE as EXECUTE_QUERY_NODE } from "./crud-operations/execute-query/constants";
import { FIND_ALL_V2_NODE as FIND_ALL_RECORD_NODE } from "./crud-operations/find-all/constants";
import { FIND_ONE_V2_NODE as FIND_ONE_RECORD_NODE } from "./crud-operations/find-one/constants";
import { UPDATE_RECORD_V2_NODE as UPDATE_RECORD_NODE } from "./crud-operations/update-record/constants";
import {
  CREATE_SHEET_RECORD_NODE,
  FIND_ONE_SHEET_RECORD_NODE,
  UPDATE_SHEET_RECORD_NODE,
  FIND_ALL_SHEET_RECORD_NODE,
  DELETE_SHEET_RECORD_NODE,
  SHEET_TRIGGER_NODE,
} from "./sheet";
const FIND_ALL_SHEET_RECORD_NODE_V2 = FIND_ALL_SHEET_RECORD_NODE;
const FIND_ONE_SHEET_RECORD_NODE_V2 = FIND_ONE_SHEET_RECORD_NODE;
import DELAY_NODE from "./delay/constant";
import { END_NODE } from "./end-v3/constants";
import { HTTP_NODE } from "./http/constants";
import { IF_ELSE_NODE } from "./if-else/constants";
import ITERATOR_NODE from "./iterator/constant";
import { QUESTIONS_NODES } from "./question-setup/constants/questionNodes";
import START_NODE from "./start/constant";

import { TRANSFORMER_NODE } from "./transformer/constants";
import WORKFLOW_SETUP_NODE from "./workflow-setup/constant";

import MATCH_PATTERN_NODE from "./text-parsers/match-pattern/constant";
import LOG_NODE from "./log/constant";
import { TINYGPT_NODE } from "./tiny-gpt/constants";
import { DELETE_SHEET_RECORD_TYPE } from "./constants/types";

import TINYGPT_RESEARCHER_NODE from "./tiny-gpt-researcher/constant";

import TINYGPT_WRITER_NODE from "./tiny-gpt-writer/constant";
import SKIP_NODE from "./skip/constant";
import BREAK_NODE from "./break/constant";

import { TINYGPT_ANALYZER_V2_NODE as TINYGPT_ANALYZER_NODE } from "./tiny-gpt-analyzer/constants";
import { TINYGPT_SUMMARIZER_V2_NODE as TINYGPT_SUMMARIZER_NODE } from "./tiny-gpt-summarizer/constants";
import { TINYGPT_TRANSLATOR_V2_NODE as TINYGPT_TRANSLATOR_NODE } from "./tiny-gpt-translator/constants";
import { TINYGPT_LEARNING_V2_NODE as TINYGPT_LEARNING_NODE } from "./tiny-gpt-learning/constants";
import { TINYGPT_CONSULTANT_V2_NODE as TINYGPT_CONSULTANT_NODE } from "./tiny-gpt-consultant/constants";
import { TINYGPT_CREATIVE_V2_NODE as TINYGPT_CREATIVE_NODE } from "./tiny-gpt-creative/constants";

import WEBHOOK_NODE from "./webhook/constant";
import { IF_ELSE_NODE_V2 } from "./if-else-v2/constants";
import TIME_BASED_TRIGGER_NODE from "./time-based-trigger/constant";
import { AGENT_SCOUT_V3_NODE as AGENT_SCOUT_NODE } from "./agent/agent-scout-v3/constants";
import AGENT_COMPOSER_NODE from "./agent/agent-composer/constant";
import HITL_NODE from "./hitl/constant";
import AGENT_WORKFLOW_NODE from "./user-agent/constant";
import AGENT_OUTPUT_NODE from "./agent-output/constant";
import AGENT_INPUT_NODE from "./agent-input/constant";
import JUMP_TO_NODE from "./jump-to/constant";
import { TRIGGER_SETUP_NODE, TRIGGER_ICON_SRC } from "./trigger-setup/constants";
import TOOL_INPUT_NODE from "./tool-input/constant";
import TOOL_OUTPUT_NODE from "./tool-output/constant";
import AGENT_NODE from "./agent-node/constant";
import { SEND_EMAIL_TO_YOURSELF_V2_NODE as SEND_EMAIL_TO_YOURSELF_NODE } from "./send-email-to-yourself-v2/constants";
import TINY_SEARCH_NODE from "./tiny-search/constant";
import TINY_SEARCH_NODE_V2 from "./tiny-search-v2/constant";
import { FORM_TRIGGER_NODE } from "./trigger-setup/constants";
import { PERSON_ENRICHMENT_V2_NODE as PERSON_ENRICHMENT_NODE } from "./enrichment/person/constants";
import { EMAIL_ENRICHMENT_V2_NODE as EMAIL_ENRICHMENT_NODE } from "./enrichment/email/constants";
import { COMPANY_ENRICHMENT_V2_NODE as COMPANY_ENRICHMENT_NODE } from "./enrichment/company/constants";
import { FOR_EACH_NODE } from "./for-each/constants";
import { REPEAT_NODE } from "./repeat/constants";
import { LOOP_UNTIL_NODE } from "./loop-until/constants";
import { LOOP_END_NODE } from "./loop-end/constants";

import {
  MYSQL_CREATE_RECORD_NODE,
  POSTGRES_CREATE_RECORD_NODE,
} from "./crud-operations/create-record/constants";
import {
  MYSQL_FIND_ALL_RECORD_NODE,
  POSTGRES_FIND_ALL_RECORD_NODE,
} from "./crud-operations/find-all/constants";
import {
  MYSQL_FIND_ONE_RECORD_NODE,
  POSTGRES_FIND_ONE_RECORD_NODE,
} from "./crud-operations/find-one/constants";
import {
  MYSQL_UPDATE_RECORD_NODE,
  POSTGRES_UPDATE_RECORD_NODE,
} from "./crud-operations/update-record/constants";
import {
  MYSQL_DELETE_RECORD_NODE,
  POSTGRES_DELETE_RECORD_NODE,
} from "./crud-operations/delete-record/constants";
import {
  MYSQL_EXECUTE_QUERY_NODE,
  POSTGRES_EXECUTE_QUERY_NODE,
} from "./crud-operations/execute-query/constants";
import { DATABASE_TYPES } from "./crud-operations/utils/databaseConfig";

export const isStringLengthGreaterThan = (str, len) => str.length > len;

export const convertHtmlToImage = async (element, payloadOverrides = {}) => {
  const canvas = await html2canvas(element, {
    scale: 3,
    width: 900,
    height: 250,
    logging: false,
    ...payloadOverrides,
  });
  let dataURL = canvas.toDataURL("image/png");
  return dataURL;
};

export const getNodeSrc = async (node, skipModuleCheck = false) => {
  if (node?.module && !skipModuleCheck && false) {
    switch (node.module) {
      case "Question": {
        let theme = localStorage.getItem(localStorageConstants.QUESTION_THEME);
        theme = theme ? JSON.parse(theme) : {};
        const element = document.createElement("div");
        element.id = "capture";
        element.style.height = "618px";
        element.style.width = "784px";
        element.style.position = "fixed";
        // element.style.padding = "20px";
        element.style.left = "-100vh";
        const root = ReactDOM.createRoot(element);
        // root.render(
        //   <QuestionCreator
        //     key={"screenshot"}
        //     theme={theme}
        //     autoSave={() => {}}
        //     defaultQuestionConfig={JSON.parse(JSON.stringify(node?.go_data)}
        //     setShowThemeManager={() => {}}
        //     setQuestion={() => {}}
        //     setShowAugmentorSettings={() => {}}
        //     viewPort={ViewPort.DESKTOP}
        //     isCaptureMode
        //     styles={{
        //       padding: "32px",
        //     }}
        //   />
        // );
        document.body.appendChild(element);
        const { width, height } = element.getBoundingClientRect();
        await new Promise((resolve) => setTimeout(resolve, 1));
        const src = await convertHtmlToImage(element, {
          width,
          height,
          useCORS: true,
          allowTaint: true,
        });
        document.body.removeChild(element);
        return src;
      }
      default:
        return null;
    }
  } else {
    switch (node.type) {
      case IF_ELSE_TYPE:
        return IF_ELSE_NODE._src;
      case CONNECTION_SETUP_TYPE:
        return CONNECTION_SETUP_NODE._src;
      case HTTP_TYPE:
        return HTTP_NODE._src;
      case DELAY_TYPE:
      case DELAY_TYPE_V2:
        return DELAY_NODE._src;
      case INPUT_SETUP_TYPE:
        return START_NODE._src;
      case SUCCESS_SETUP_TYPE:
      case END_NODE_TYPE:
        return END_NODE._src;
      // case CREATE_TYPE:
      //   return CREATE_RECORD_NODE._src;
      // case FIND_ALL_TYPE:
      //   return FIND_ALL_RECORD_NODE._src;
      // case FIND_ONE_TYPE:
      //   return FIND_ONE_RECORD_NODE._src;
      // case UPDATE_TYPE:
      //   return UPDATE_RECORD_NODE._src;
      // case DELETE_TYPE:
      //   return DELETE_RECORD_NODE._src;
      // case EXECUTE_TYPE:
      //   return EXECUTE_QUERY_NODE._src;
      case TRANSFORMER_TYPE:
      case TRANSFORMER_TYPE_V3:
        return TRANSFORMER_NODE._src;
      case WORKFLOW_SETUP_TYPE:
        return WORKFLOW_SETUP_NODE._src;
      case TIME_BASED_TRIGGER:
        return TIME_BASED_TRIGGER_NODE._src;
      case INTEGRATION_TYPE: {
        if (node?._src) return node._src;

        if (node?.go_data?.flow?.project_id) {
          try {
            const response = await assetSDKServices.findOne({
              _id: node.go_data.flow.project_id,
            });
            return response?.result?.meta?.thumbnail || "";
          } catch {
            return "";
          }
        }
        
        if (skipModuleCheck) return "";
        
        if (node?.id) {
          try {
            const response = await canvasSDKServices.getPublishedByAsset({
              asset_id: node.id,
              include_project_variable: false,
            });
            let thumbnail = response?.result?.meta?.thumbnail || response?.result?.thumbnail || "";
            if (!thumbnail) {
              try {
                const eventResponse = await assetSDKServices.findOne({ _id: node.id });
                if (eventResponse?.status === "success" && eventResponse?.result?.meta?.thumbnail) {
                  thumbnail = eventResponse.result.meta.thumbnail;
                }
              } catch {}
            }
            return thumbnail;
          } catch {
            return "";
          }
        }
        
        return "";
      }
      case ITERATOR_TYPE:
      case ITERATOR_TYPE_V2:
        return ITERATOR_NODE._src;
      case ARRAY_AGGREGATOR_TYPE:
        return ARRAY_AGGREGATOR_NODE._src;
      case CREATE_SHEET_RECORD_TYPE:
        return CREATE_SHEET_RECORD_NODE._src;
      case FIND_ONE_SHEET_RECORD_TYPE:
        return FIND_ONE_SHEET_RECORD_NODE._src;
      case UPDATE_SHEET_RECORD_TYPE:
      case UPDATE_SHEET_RECORDS_TYPE:
        return UPDATE_SHEET_RECORD_NODE._src;
      case FIND_ALL_SHEET_RECORD_TYPE:
        return FIND_ALL_SHEET_RECORD_NODE._src;
      case DELETE_SHEET_RECORD_TYPE:
        return DELETE_SHEET_RECORD_NODE._src;
      case MATCH_PATTERN_TYPE:
        return MATCH_PATTERN_NODE._src;
      case LOG_TYPE:
        return LOG_NODE._src;
      case TINY_GPT_TYPE:
        return TINYGPT_NODE._src;
      case TINY_GPT_RESEARCHER_TYPE:
        return TINYGPT_RESEARCHER_NODE._src;
      case TINY_GPT_ANALYZER_TYPE:
        return TINYGPT_ANALYZER_NODE._src;
      case TINY_GPT_WRITER_TYPE:
        return TINYGPT_WRITER_NODE._src;
      case TINY_GPT_SUMMARIZER_TYPE:
        return TINYGPT_SUMMARIZER_NODE._src;
      case TINY_GPT_TRANSLATOR_TYPE:
        return TINYGPT_TRANSLATOR_NODE._src;
      case TINY_GPT_LEARNING_TYPE:
        return TINYGPT_LEARNING_NODE._src;
      case TINY_GPT_CONSULTANT_TYPE:
        return TINYGPT_CONSULTANT_NODE._src;
      case TINY_GPT_CREATIVE_TYPE:
        return TINYGPT_CREATIVE_NODE._src;
      case SKIP_TYPE:
        return SKIP_NODE._src;
      case BREAK_TYPE:
        return BREAK_NODE._src;
      case FOR_EACH_TYPE:
        return FOR_EACH_NODE._src;
      case REPEAT_TYPE:
        return REPEAT_NODE._src;
      case LOOP_UNTIL_TYPE:
        return LOOP_UNTIL_NODE._src;
      case LOOP_END_TYPE:
        return LOOP_END_NODE._src;
      case WEBHOOK_TYPE:
        return WEBHOOK_NODE._src;
      case IF_ELSE_TYPE_V2:
        return IF_ELSE_NODE_V2._src;
      case SHEET_DATE_FIELD_TRIGGER:
        return TRIGGER_ICON_SRC[SHEET_DATE_FIELD_TRIGGER];
      case QuestionType.SHORT_TEXT:
        return QUESTIONS_NODES[QuestionType.SHORT_TEXT]._src;
      case QuestionType.LONG_TEXT:
        return QUESTIONS_NODES[QuestionType.LONG_TEXT]._src;
      case QuestionType.MCQ:
        return QUESTIONS_NODES[QuestionType.MCQ]._src;
      case QuestionType.SCQ:
        return QUESTIONS_NODES[QuestionType.SCQ]._src;
      case QuestionType.PHONE_NUMBER:
        return QUESTIONS_NODES[QuestionType.PHONE_NUMBER]._src;
      case QuestionType.ZIP_CODE:
        return QUESTIONS_NODES[QuestionType.ZIP_CODE]._src;
      case QuestionType.DROP_DOWN:
        return QUESTIONS_NODES[QuestionType.DROP_DOWN]._src;
      case QuestionType.DROP_DOWN_STATIC:
        return QUESTIONS_NODES[QuestionType.DROP_DOWN_STATIC]._src;
      case QuestionType.YES_NO:
        return QUESTIONS_NODES[QuestionType.YES_NO]._src;
      case QuestionType.RANKING:
        return QUESTIONS_NODES[QuestionType.RANKING]._src;
      case QuestionType.EMAIL:
        return QUESTIONS_NODES[QuestionType.EMAIL]._src;
      case QuestionType.CONNECTION:
        return QUESTIONS_NODES[QuestionType.CONNECTION]._src;
      case QuestionType.FORMULA_BAR:
        return QUESTIONS_NODES[QuestionType.FORMULA_BAR]._src;
      case QuestionType.WELCOME:
        return QUESTIONS_NODES[QuestionType.WELCOME]._src;
      case QuestionType.QUOTE:
        return QUESTIONS_NODES[QuestionType.QUOTE]._src;
      case QuestionType.ENDING:
        return QUESTIONS_NODES[QuestionType.ENDING]._src;
      case QuestionType.DATE:
        return QUESTIONS_NODES[QuestionType.DATE]._src;
      case QuestionType.CURRENCY:
        return QUESTIONS_NODES[QuestionType.CURRENCY]._src;
      case QuestionType.KEY_VALUE_TABLE:
        return QUESTIONS_NODES[QuestionType.KEY_VALUE_TABLE]._src;
      case QuestionType.NUMBER:
        return QUESTIONS_NODES[QuestionType.NUMBER]._src;
      case QuestionType.FILE_PICKER:
        return QUESTIONS_NODES[QuestionType.FILE_PICKER]._src;
      case QuestionType.TIME:
        return QUESTIONS_NODES[QuestionType.TIME]._src;
      case QuestionType.SIGNATURE:
        return QUESTIONS_NODES[QuestionType.SIGNATURE]._src;
      case QuestionType.LOADING:
        return QUESTIONS_NODES[QuestionType.LOADING]._src;
      case QuestionType.ADDRESS:
        return QUESTIONS_NODES[QuestionType.ADDRESS]._src;
      case QuestionType.TEXT_PREVIEW:
        return QUESTIONS_NODES[QuestionType.TEXT_PREVIEW]._src;
      case QuestionType.QUESTIONS_GRID:
        return QUESTIONS_NODES[QuestionType.QUESTIONS_GRID]._src;
      case QuestionType.AUTOCOMPLETE:
        return QUESTIONS_NODES[QuestionType.AUTOCOMPLETE]._src;
      case QuestionType.PDF_VIEWER:
        return QUESTIONS_NODES[QuestionType.PDF_VIEWER]._src;
      case QuestionType.MULTI_QUESTION_PAGE:
        return QUESTIONS_NODES[QuestionType.MULTI_QUESTION_PAGE]._src;
      case QuestionType.COLLECT_PAYMENT:
        return QUESTIONS_NODES[QuestionType.COLLECT_PAYMENT]._src;
      case QuestionType.RATING:
        return QUESTIONS_NODES[QuestionType.RATING]._src;
      case QuestionType.OPINION_SCALE:
        return QUESTIONS_NODES[QuestionType.OPINION_SCALE]._src;
      case QuestionType.SLIDER:
        return QUESTIONS_NODES[QuestionType.SLIDER]._src;
      case QuestionType.TERMS_OF_USE:
        return QUESTIONS_NODES[QuestionType.TERMS_OF_USE]._src;
      case QuestionType.STRIPE_PAYMENT:
        return QUESTIONS_NODES[QuestionType.STRIPE_PAYMENT]._src;
      case AGENT_TINY_SCOUT:
        return AGENT_SCOUT_NODE._src;
      case AGENT_TINY_COMPOSER:
        return AGENT_COMPOSER_NODE._src;
      case SHEET_TRIGGER:
        return SHEET_TRIGGER_NODE._src;
      case QuestionType.PICTURE:
        return QUESTIONS_NODES[QuestionType.PICTURE]._src;
      case QuestionType.QUESTION_REPEATER:
        return QUESTIONS_NODES[QuestionType.QUESTION_REPEATER]._src;
      case HITL_TYPE:
        return HITL_NODE._src;
      // case AGENT_WORKFLOW:
      //   return AGENT_WORKFLOW_NODE._src;
      case AGENT_OUTPUT:
        return AGENT_OUTPUT_NODE._src;
      case AGENT_INPUT:
        return AGENT_INPUT_NODE._src;
      case JUMP_TO_TYPE:
        return JUMP_TO_NODE._src;
      case TRIGGER_SETUP_TYPE:
        return node?._src || TRIGGER_SETUP_NODE._src;
      case TOOL_INPUT_TYPE:
        return TOOL_INPUT_NODE._src;
      case TOOL_OUTPUT_TYPE:
        return TOOL_OUTPUT_NODE._src;
      case AGENT_WORKFLOW:
        return AGENT_NODE._src;
      case SEND_EMAIL_TO_YOURSELF_TYPE:
        return SEND_EMAIL_TO_YOURSELF_NODE._src;
      case FORM_TRIGGER:
        return FORM_TRIGGER_NODE._src;
      case TINY_SEARCH:
        return TINY_SEARCH_NODE._src;
      case TINY_SEARCH_V2:
        return TINY_SEARCH_NODE_V2._src;
      case PERSON_ENRICHMENT_TYPE:
      case PERSON_ENRICHMENT_V2_TYPE:
        return PERSON_ENRICHMENT_NODE._src;
      case EMAIL_ENRICHMENT_TYPE:
      case EMAIL_ENRICHMENT_V2_TYPE:
        return EMAIL_ENRICHMENT_NODE._src;
      case COMPANY_ENRICHMENT_TYPE:
      case COMPANY_ENRICHMENT_V2_TYPE:
        return COMPANY_ENRICHMENT_NODE._src;
      case CREATE_TYPE:
      case CREATE_RECORD_V2_TYPE:
        if (node?.databaseType === DATABASE_TYPES.MYSQL) {
          return MYSQL_CREATE_RECORD_NODE._src;
        } else if (node?.databaseType === DATABASE_TYPES.POSTGRESQL) {
          return POSTGRES_CREATE_RECORD_NODE._src;
        }
        return CREATE_RECORD_NODE._src;
      case FIND_ALL_TYPE:
      case FIND_ALL_V2_TYPE:
        if (node?.databaseType === DATABASE_TYPES.MYSQL) {
          return MYSQL_FIND_ALL_RECORD_NODE._src;
        } else if (node?.databaseType === DATABASE_TYPES.POSTGRESQL) {
          return POSTGRES_FIND_ALL_RECORD_NODE._src;
        }
        return FIND_ALL_RECORD_NODE._src;
      case FIND_ONE_TYPE:
      case FIND_ONE_V2_TYPE:
        if (node?.databaseType === DATABASE_TYPES.MYSQL) {
          return MYSQL_FIND_ONE_RECORD_NODE._src;
        } else if (node?.databaseType === DATABASE_TYPES.POSTGRESQL) {
          return POSTGRES_FIND_ONE_RECORD_NODE._src;
        }
        return FIND_ONE_RECORD_NODE._src;
      case UPDATE_TYPE:
      case UPDATE_RECORD_V2_TYPE:
        if (node?.databaseType === DATABASE_TYPES.MYSQL) {
          return MYSQL_UPDATE_RECORD_NODE._src;
        } else if (node?.databaseType === DATABASE_TYPES.POSTGRESQL) {
          return POSTGRES_UPDATE_RECORD_NODE._src;
        }
        return UPDATE_RECORD_NODE._src;
      case DELETE_TYPE:
      case DELETE_V2_TYPE:
        if (node?.databaseType === DATABASE_TYPES.MYSQL) {
          return MYSQL_DELETE_RECORD_NODE._src;
        } else if (node?.databaseType === DATABASE_TYPES.POSTGRESQL) {
          return POSTGRES_DELETE_RECORD_NODE._src;
        }
        return DELETE_RECORD_NODE._src;
      case EXECUTE_TYPE:
      case EXECUTE_V2_TYPE:
        if (node?.databaseType === DATABASE_TYPES.MYSQL) {
          return MYSQL_EXECUTE_QUERY_NODE._src;
        } else if (node?.databaseType === DATABASE_TYPES.POSTGRESQL) {
          return POSTGRES_EXECUTE_QUERY_NODE._src;
        }
        return EXECUTE_QUERY_NODE._src;
    }
  }
};

export const validateIfElseData = (data) => {
  let errors = [];
  // if (!data.label && !errors.includes(IF_ELSE_ERRORS.IF_ELSE_LABEL_MISSING)) {
  //   errors.push(IF_ELSE_ERRORS.IF_ELSE_LABEL_MISSING);
  // }

  if (
    !data?.ifData?.length ||
    (data?.ifData?.length === 1 &&
      !data?.ifData[0]?.condition &&
      !data?.ifData[0]?.jumpTo &&
      !errors.includes(IF_ELSE_ERRORS.IF_ELSE_NO_IF_CONDITION))
  ) {
    errors.push(IF_ELSE_ERRORS.IF_ELSE_NO_IF_CONDITION);
  }

  const consolidatedData = [...(data?.ifData || []), ...(data?.elseData || [])];

  consolidatedData?.forEach((row) => {
    if (
      row?.condition?.blocks?.length > 0 &&
      !row?.jumpTo &&
      !errors.includes(IF_ELSE_ERRORS.IF_ELSE_MISSING_JUMP_TO)
    ) {
      errors.push(IF_ELSE_ERRORS.IF_ELSE_MISSING_JUMP_TO);
    } else if (
      row?.jumpTo &&
      !row?.condition?.blocks?.length &&
      !row?.conditionStr &&
      !errors.includes(IF_ELSE_ERRORS.IF_ELSE_MISSING_CONDITION)
    ) {
      errors.push(IF_ELSE_ERRORS.IF_ELSE_MISSING_CONDITION);
    }
  });

  return errors;
};

export const removeIndicesStartingFromIndex = (array = [], index) => {
  return array.filter((i) => i < index);
};
export const addIndices = (array = [], indices = []) => {
  // add only those indices which are not present in the array
  return [...array, ...indices.filter((i) => !array.includes(i))];
};
export const getAgentNode = (type) => {
  switch (type) {
    case WEBHOOK_TYPE:
      return WEBHOOK_NODE;
    case INPUT_SETUP_TYPE:
      return START_NODE;
    case TIME_BASED_TRIGGER:
      return TIME_BASED_TRIGGER_NODE;
    default:
      return null;
  }
};
