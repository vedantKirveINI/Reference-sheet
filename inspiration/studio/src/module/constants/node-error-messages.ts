import { QuestionType } from "./questionType";

export const NODE_ERROR_MESSAGES = {
  [QuestionType.MCQ]: {
    defaultValueError:
      "The default value in the question settings must be one of the available options.",
    optionsError: "The question must have at least one option.",
  },
  [QuestionType.SCQ]: {
    defaultValueError:
      "The default value in the question settings must be one of the available options.",
    optionsError: "The question must have at least one option.",
  },

  [QuestionType.DROP_DOWN_STATIC]: {
    defaultValueError:
      "The default value in the question settings must be one of the available options.",
    optionsError: "The question must have at least one option.",
  },
  [QuestionType.RANKING]: {
    optionsError: "The question must have at least one option.",
  },
};
