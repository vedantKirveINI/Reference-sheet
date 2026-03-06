import { ViewPort, QuestionType } from "@oute/oute-ds.core.constants";

const getMarginTopAccordingToQuestionType = (questionType: QuestionType) => {
  if (questionType === QuestionType.MCQ || questionType === QuestionType.SCQ) {
    return "-10px";
  }

  if (questionType === QuestionType.KEY_VALUE_TABLE) {
    return "-300px";
  }

  return "-67px";
};

export const getPlaceholderStyles = ({ viewPort, questionType }) => {
  return {
    width: "100%",
    height: "fit-content",
    opacity: 0.7,
    zIndex: 1,
    display: "flex",
    alignItems: viewPort === ViewPort.MOBILE ? "flex-end" : ("center" as const),
    justifyContent: "space-between" as const,
    padding: "1em 0em 0.75em 0em",
    pointerEvents: "none" as const,
    marginTop: getMarginTopAccordingToQuestionType(questionType),
    "& >:first-of-type": {
      width: "100%",
    },
  };
};

export const getQuestionGroupStyles = () => {
  return {
    width: "50%",
    display: "flex",
    justifyContent: "flex-start" as const,
    alignItems: "flex-end" as const,
    flexWrap: "wrap" as const,
    paddingLeft: "2.5em",
    gap: 10,
  };
};
export const getButtonTextStyles = () => {
  return {
    color: "#263238",
    fontSize: "1rem",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "150%" /* 1.875rem */,
  };
};
