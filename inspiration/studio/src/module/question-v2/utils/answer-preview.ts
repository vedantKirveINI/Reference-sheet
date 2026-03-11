import { QuestionType } from "@oute/oute-ds.core.constants";

const answerToText = (type: QuestionType, answer: any): string => {
  switch (type) {
    case QuestionType.SHORT_TEXT:
    case QuestionType.LONG_TEXT:
    case QuestionType.DATE:
    case QuestionType.NUMBER:
    case QuestionType.EMAIL:
    case QuestionType.SCQ:
    case QuestionType.YES_NO:
      return answer?.response;

    case QuestionType.MCQ:
      return answer?.response?.__to_string;

    case QuestionType.DROP_DOWN:
      if (Array.isArray(answer?.response)) {
        return answer?.response.map((item) => item?.label).join(", ");
      }
      return answer?.response?.label;

    case QuestionType.DROP_DOWN_STATIC:
      if (Array.isArray(answer?.response)) {
        return answer?.response.map((item) => item).join(", ");
      }
      return answer?.response;
    case QuestionType.SLIDER:
      return answer?.response;

    default:
      return "No Response";
  }
};

export { answerToText };
