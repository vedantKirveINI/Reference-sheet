import { Mode, ViewPort } from "@oute/oute-ds.core.constants";

const getMcqOptionsContainer = ({
  questionAlignment,
  mode,
  viewPort,
}: {
  questionAlignment?: string;
  mode?: string;
  viewPort?: string;
}) => {
  const align =
    questionAlignment === "center" && mode === Mode.CARD ? "center" : "stretch";
  const isMobile = viewPort === ViewPort.MOBILE;
  return {
    width: isMobile ? "max-content" : "100%",
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: align,
    boxSizing: "border-box",
  } as const;
};

const getWrappedEditorButtonStyles = {
  justifyContent: "flex-start",
};

const getMcqOptionCreatorGroupContainerStyle = () => {
  return {
    display: "flex",
    justifyContent: "flex-start" as const,
    flexDirection: "column" as const,
  };
};
const getMcqOptionGroupStyles = ({
  column,
  viewPort,
}: {
  column: number;
  viewPort?: string;
}) => {
  const isMobile = viewPort === ViewPort.MOBILE;
  return {
    width: isMobile ? "max-content" : "100%",
    maxWidth: "100%",
    display: "grid",
    gridTemplateColumns: `repeat(${column}, minmax(0, 1fr))`,
    gap: "0.5rem",
    marginBottom: "0.5rem",
    alignContent: "start",
    alignItems: "stretch",
  };
};
const getButtonTextStyles = () => {
  return {
    color: "#263238",
    fontSize: "1rem",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "150%" /* 1.875rem */,
  };
};

export const getAddOptionStyles = () => {
  return {
    opacity: "0.5",
  };
};

export {
  getWrappedEditorButtonStyles,
  getMcqOptionsContainer,
  getMcqOptionCreatorGroupContainerStyle,
  getMcqOptionGroupStyles,
  getButtonTextStyles,
};
