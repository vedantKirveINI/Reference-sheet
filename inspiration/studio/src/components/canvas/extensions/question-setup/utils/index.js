import {
  Mode,
  QuestionType,
  removeTagsFromString,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import { localStorageConstants } from "@src/module/constants";
import { DEFAULT_QUESTION_CONFIG } from "../constants/default-question-config";
import { QUESTION_CONFIG_FC, QUESTION_CONFIG_CMS } from "../../../config";
import { cloneDeep, isEmpty } from "lodash";
import { componentSDKServices } from "@/components/canvas/services/componentSDKServices";

/**
 * Append next to content. Add a single space only when content ends with
 * whitespace (source had a space there), so we get "hey " + "bud" => "hey bud"
 * and "bud" + "dy" => "buddy" (no space).
 */
function appendWithSpace(content, next) {
  if (next === "") return content;
  if (content.length === 0) return next;
  const endsWithWs = /\s$/.test(content);
  if (endsWithWs) return content.replace(/\s+$/, "") + " " + next;
  return content + next;
}

function extractContent(element) {
  let content = "";

  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Keep raw text (including trailing space) so appendWithSpace can tell "hey " from "bud"
      content += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.hasAttribute("data-lexical-recall-question")) {
        content = appendWithSpace(
          content,
          removeTagsFromString(
            node.getAttribute("data-lexical-recall-question") || ""
          )
        );
      }
      if (node.tagName === "A") {
        content = appendWithSpace(content, extractContent(node));
      } else {
        content = appendWithSpace(content, extractContent(node));
      }
    }
  });

  // Don't trim here so parent's appendWithSpace sees trailing space (e.g. "hey ")
  return content;
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
  if (typeof localStorage === "undefined") return Mode.CARD;
  return (
    localStorage.getItem(localStorageConstants.QUESTION_CREATOR_MODE) ||
    Mode.CARD
  );
};

const getDefaultViewPort = (eventType) => {
  if (eventType) return ViewPort.MOBILE;
  if (typeof localStorage === "undefined") return ViewPort.MOBILE;
  return (
    localStorage.getItem(localStorageConstants.QUESTION_CREATOR_VIEWPORT) ||
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
    case QuestionType.DROP_DOWN: {
      delete transformedQuestion?.output;
      const settings = transformedQuestion?.settings;
      const dynamicInputs = settings?.dynamicInputs;
      const sourceType = settings?.sourceType;
      const mapObjectItems = dynamicInputs?.mapObjectItems;
      const variable = dynamicInputs?.variable;
      const blocks = variable?.blocks;

      if (
        sourceType === "dynamic" &&
        mapObjectItems === true &&
        Array.isArray(blocks) &&
        blocks.length === 1
      ) {
        const block = blocks[0];
        const variableData = block?.variableData;
        const schema = variableData?.schema;

        if (
          block?.returnType === "array" &&
          Array.isArray(schema) &&
          schema.length > 0
        ) {
          const firstSchemaItem = schema[0];

          if (
            firstSchemaItem?.type === "object" &&
            Array.isArray(firstSchemaItem.schema)
          ) {
            try {
              const defaultObject =
                componentSDKServices.parseSchemaWithDefaultValue(
                  { schema: firstSchemaItem.schema },
                  false
                );
              if (defaultObject && typeof defaultObject === "object") {
                const baseValue = { ...defaultObject, id: "", label: "" };
                const value =
                  settings?.selectionType === "Single"
                    ? baseValue
                    : [baseValue];
                transformedQuestion = { ...transformedQuestion, value };
                break;
              }
            } catch (_) {
              // Fall through to default value
            }
          }
        }
      }

      if (transformedQuestion?.settings?.selectionType !== "Single") {
        transformedQuestion = {
          ...transformedQuestion,
          value: [{ id: "", label: "" }],
        };
      } else {
        transformedQuestion = {
          ...transformedQuestion,
          value: { id: "", label: "" },
        };
      }
      break;
    }

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
