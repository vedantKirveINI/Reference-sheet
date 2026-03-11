import { QuestionType } from "@oute/oute-ds.core.constants";

export const getQuestionPlaceholder = (type) => {
  switch (type) {
    case QuestionType.ENDING:
      return "Say bye! Recall information with @";
    case QuestionType.WELCOME:
      return "Say hi! Recall information with @";
    case QuestionType.QUOTE:
      return "Your quote goes here. Recall information with @";
    case QuestionType.LOADING:
      return "Your text goes here. Recall information with @";
    default:
      return "Your question here. Recall information with @";
  }
};
