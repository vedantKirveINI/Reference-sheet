import {
  QuestionType,
  DEFAULT_QUESTION_DESCRIPTION,
  DEFAULT_QUESTION_TITLE,
  QuestionAlignments,
} from "../../../../../module/constants";

export const FORMULA_BAR_DEFAULT_SETUP = {
  _id: "formula-bar123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.FORMULA_BAR,
  buttonLabel: "<strong>Lets Go!</strong>",
  variables: {},
  value: "",
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
  },
};
