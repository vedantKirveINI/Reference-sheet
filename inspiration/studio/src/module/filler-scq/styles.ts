import { Mode } from "@oute/oute-ds.core.constants";

const getMcqFillerContainerStyles = ({
  questionAlignment,
  mode,
  isAlignmentVertical,
  theme,
}) => {
  return {
    maxWidth: "100%",
    width: questionAlignment === "center" ? "100%" : "max-content",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: isAlignmentVertical && "column",
    justifyContent:
      questionAlignment === "center" && mode === Mode.CARD && "flex-start",
    alignItems:
      questionAlignment === "center" && mode === Mode.CARD && "center",
    flexWrap: "wrap",
    gap: "0.75em",
    "& textarea": {
      color: `${theme?.styles?.buttons} !important`,
    },
  } as any;
};

export { getMcqFillerContainerStyles };
