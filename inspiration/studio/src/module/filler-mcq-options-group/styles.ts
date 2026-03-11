import { Mode, ViewPort } from "@oute/oute-ds.core.constants";

const getMcqFillerContainerStyles = ({
  questionAlignment,
  mode,
  isAlignmentVertical,
  theme,
  viewPort,
}) => {
  const isMobile = viewPort === ViewPort.MOBILE;
  const width =
    isMobile || questionAlignment !== "center" ? "max-content" : "100%";
  return {
    maxWidth: isMobile ? "100%" : "min(100%, 26em)",
    width,
    // Preview: ensure options block has a minimum width so options are not too narrow
    ...(isMobile ? {} : { minWidth: "min(24em, 100%)" }),
    boxSizing: "border-box",
    display: "flex",
    flexDirection: isAlignmentVertical && "column",
    justifyContent:
      questionAlignment === "center" && mode === Mode.CARD && "flex-start",
    alignItems:
      questionAlignment === "center" && mode === Mode.CARD && "center",
    flexWrap: "wrap",
    gap: "0.5em",
    "& textarea": {
      color: `${theme?.styles?.buttons} !important`,
    },
  } as any;
};

export { getMcqFillerContainerStyles };
