import {
  localStorageConstants,
  Mode,
  QuestionType,
  removeTagsFromString,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import { DEFAULT_QUESTION_CONFIG } from "../constants/default-question-config";
import { QUESTION_CONFIG_FC, QUESTION_CONFIG_CMS } from "../../../config";
import { cloneDeep, isEmpty } from "lodash";
// import { cookieUtils } from "oute-ds-utils";
import { cookieUtils } from "@src/module/ods";

function extractContent(element) {
  let content = "";

  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Append text content
      content += node.textContent.trim();
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.hasAttribute("data-lexical-recall-question")) {
        content +=
          " " +
          removeTagsFromString(
            node.getAttribute("data-lexical-recall-question") || ""
          );
      }
      if (node.tagName === "A") {
        // Append link text and URL
        content += ` ${extractContent(node)}`;
      } else {
        // Recursively process child elements
        content += " " + extractContent(node);
      }
    }
  });

  return content.trim();
}

const extractTextContentFromLexicalString = (lexicalString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(lexicalString, "text/html");

  const paragraphs = Array.from(doc.querySelectorAll("p"))
    .map((p) => extractContent(p).trim())
    .filter((content) => {
      return !isEmpty(content);
    });

  return paragraphs.join(" ");
};

const getDefaultQuestionConfigFromType = (type) => {
  if (!Object.values(QuestionType).includes(type)) {
    throw new Error(
      `Invalid question type: '${type}'. Expected one of: ${Object.values(QuestionType).join(", ")}`
    );
  }
  return DEFAULT_QUESTION_CONFIG[type];
};

const getQuestionConfig = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("data must be an object");
  }
  if (!data.type) {
    throw new Error("type is required");
  }
  if (data.go_data?.type) {
    return data.go_data;
  }
  return getDefaultQuestionConfigFromType(data.type);
};

const getDefaultMode = (eventType) => {
  if (eventType) return Mode.CARD;
  return (
    cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_MODE) ||
    Mode.CARD
  );
};

const getDefaultViewPort = (eventType) => {
  if (eventType) return ViewPort.MOBILE;
  return (
    cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_VIEWPORT) ||
    ViewPort.MOBILE
  );
};

const isChatModeDisabled = (questionType) => {
  const CHAT_DISABLED_QUESTION_TYPES = [QuestionType.MULTI_QUESTION_PAGE];
  return CHAT_DISABLED_QUESTION_TYPES.includes(questionType);
};

const getSearchConfigForMultiQuestions = () => {
  return [
    {
      ...QUESTION_CONFIG_FC,
      components: QUESTION_CONFIG_FC.components.filter((component) => {
        return component?.meta?.isMultiQuestionSupported === true;
      }),
    },
  ];
};

const getSearchConfigForQuestionRepeator = () => {
  return [
    {
      ...QUESTION_CONFIG_CMS,
      components: QUESTION_CONFIG_CMS.components.filter((component) => {
        return component?.meta?.isQuestionRepeatorSupported === true;
      }),
    },
  ];
};

const getSearchConfigBasedOnQuestionType = (questionType) => {
  if (questionType === QuestionType.MULTI_QUESTION_PAGE) {
    return getSearchConfigForMultiQuestions();
  }

  if (questionType === QuestionType.QUESTION_REPEATER) {
    return getSearchConfigForQuestionRepeator();
  }

  return [];
};

const getTransformedQuetionGoData = ({ question = {} }) => {
  let transformedQuestion = cloneDeep(question);

  switch (transformedQuestion?.type) {
    case QuestionType.MULTI_QUESTION_PAGE:
    case QuestionType.QUESTION_REPEATER: {
      delete transformedQuestion?.output;
      let value = {};
      let key_config_map = {};

      for (const [questionId, questionData] of Object.entries(
        question?.questions
      )) {
        value[questionId] = {
          response: questionData?.value,
        };
        key_config_map[questionId] = {
          display_name: {
            key: "label",
            value: extractTextContentFromLexicalString(questionData?.question),
          },
        };
      }

      transformedQuestion = {
        ...transformedQuestion,
        value:
          transformedQuestion.type === QuestionType.QUESTION_REPEATER
            ? [value]
            : value,
        key_config_map,
      };

      break;
    }
    case QuestionType.DROP_DOWN:
      delete transformedQuestion?.output;
      if (transformedQuestion?.settings?.selectionType !== "Single") {
        transformedQuestion = {
          ...transformedQuestion,
          value: [
            {
              id: "",
              label: "",
            },
          ],
        };
      } else {
        transformedQuestion = {
          ...transformedQuestion,
          value: {
            id: "",
            label: "",
          },
        };
      }
      break;

    case QuestionType.DROP_DOWN_STATIC:
      delete transformedQuestion?.output;
      if (transformedQuestion?.settings?.selectionType !== "Single") {
        transformedQuestion = {
          ...transformedQuestion,
          value: ["dummy"],
        };
      } else {
        transformedQuestion = {
          ...transformedQuestion,
          value: "dummy",
        };
      }
      break;
    // Reverting Datatype again(20/01/2025) and adding options
    // ChangedData : 24/01/2025
    case QuestionType.YES_NO:
      delete transformedQuestion?.output;
      if (!transformedQuestion?.options) {
        transformedQuestion = {
          ...transformedQuestion,
          options: ["Yes", "No"],
        };
      }
      if (typeof transformedQuestion?.value === "boolean") {
        transformedQuestion = {
          ...transformedQuestion,
          value: "No",
        };
      }
      break;

    case QuestionType.STRIPE_PAYMENT: {
      const isSendReceipt = Boolean(transformedQuestion?.settings?.sendReceipt);
      delete transformedQuestion?.output;
      transformedQuestion = {
        ...transformedQuestion,
        value: {
          amount: "",
          name: "",
          ...(isSendReceipt && { email: "" }),
        },
      };
      break;
    }
    default:
      break;
  }

  return transformedQuestion;
};

export {
  getTransformedQuetionGoData,
  getDefaultQuestionConfigFromType,
  getQuestionConfig,
  getDefaultMode,
  getDefaultViewPort,
  isChatModeDisabled,
  getSearchConfigBasedOnQuestionType,
  extractTextContentFromLexicalString,
};
