import { QuestionType } from "../../../../../module/constants";

const PUBLISH_POPPER_TABS = {
  FORM_DISTRIBUTION: "SHARE",
  FORM_RESPONSES: "RESPONSES",
  FORM_SETTINGS: "SETTINGS",
  FORM_ATTRIBUTION: "ANALYTICS",
};

const INDEPENDENT_QUESTIONS_TYPE = Object.values(QuestionType);
const UNMAPPABLE_QUESTIONS_TYPE = [
  QuestionType.WELCOME,
  QuestionType.ENDING,
  QuestionType.QUOTE,
  QuestionType.LOADING,
  QuestionType.PDF_VIEWER,
  QuestionType.TEXT_PREVIEW,
];

const QUESTION_ID_SEPERATOR = "____";

export {
  INDEPENDENT_QUESTIONS_TYPE,
  UNMAPPABLE_QUESTIONS_TYPE,
  PUBLISH_POPPER_TABS,
  QUESTION_ID_SEPERATOR,
};
