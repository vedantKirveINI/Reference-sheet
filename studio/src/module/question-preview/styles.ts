import { ViewPort } from "@oute/oute-ds.core.constants";
const getQuestionPreviewContainerStyles = {
  boxSizing: "border-box",
  position: "relative",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  background: "#F2F6FB",
} as const;

const getQuestionFillerWrapperStyles = (option) => {
  const { viewPort } = option;
  return {
    position: "relative",
    margin: "auto",
    width: viewPort === ViewPort.DESKTOP ? "80%" : "30%",
    minWidth: "25em",
    height: "calc(100% - 7em)",
    borderRadius: "0.75em",
    border: "0.75px solid rgba(0, 0, 0, 0.20)",
    boxShadow: "0px 6px 12px 0px rgba(122, 124, 141, 0.20)",
    overflow: "hidden",
    background: "linear-gradient(224deg, #FBECFF 0.36%, #BAE8FF 100%)",
  } as const;
};

export { getQuestionPreviewContainerStyles, getQuestionFillerWrapperStyles };
