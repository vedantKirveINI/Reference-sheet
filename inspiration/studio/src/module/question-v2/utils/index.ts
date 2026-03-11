import { QuestionType } from "@oute/oute-ds.core.constants";
import { Mode, ViewPort } from "@oute/oute-ds.core.constants";
import { IMAGE_ALIGNMENT } from "@oute/oute-ds.core.constants/imagePickerConstant";

export const getBoxesPerRowForPicture = ({
  viewPort,
  mode,
  isAugmentorAvailable,
  augmentor,
}) =>
  viewPort === ViewPort.MOBILE
    ? 1
    : isAugmentorAvailable &&
        ((mode === Mode.CARD &&
          [IMAGE_ALIGNMENT.Right, IMAGE_ALIGNMENT.Left].includes(
            augmentor?.alignment?.cardDesktop
          )) ||
          (mode === Mode.CLASSIC &&
            [IMAGE_ALIGNMENT.Right, IMAGE_ALIGNMENT.Left].includes(
              augmentor?.alignment?.classicDesktop
            )))
      ? 2
      : 4;

export { getMCQGuideline } from "./question-guidelines";
export { convertRecallQuestionToAnswer } from "./convert-recall-to-answer";
export { shouldRenderCTA } from "./call-to-action";
export * from "./answer-preview";

export const getQuestionPlaceholder = (type) => {
  switch (type) {
    case QuestionType.ENDING:
      return "Say bye! Recall information with @";
    case QuestionType.WELCOME:
      return "Say hi 👋";
    case QuestionType.QUOTE:
      return "Your quote goes here. Recall information with @";
    case QuestionType.LOADING:
      return "Your text goes here. Recall information with @";
    default:
      return "Your question here. Recall information with @";
  }
};

export const sanatizeQuestionTypeToText = (questionType: QuestionType) => {
  if (!questionType) return "";
  const sentence = questionType.replace(/_/g, " ").toLowerCase();

  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};
