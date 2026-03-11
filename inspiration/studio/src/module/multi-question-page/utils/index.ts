import { QuestionType } from "@oute/oute-ds.core.constants";

export const sanatizeQuestionTypeToText = (questionType: QuestionType) => {
  if (!questionType) return "";
  const sentence = questionType.replace(/_/g, " ").toLowerCase();

  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};
