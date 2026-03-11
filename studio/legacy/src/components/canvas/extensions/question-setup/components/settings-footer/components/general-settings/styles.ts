export const getQuestionAlignmentContainerStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "0.75em",
} as const;

export const alignmentTabsContainer = () => {
  return {
    flexDirection: "row" as const,
    height: 40,
    width: 80,
    borderRadius: 10,
    overflow: "hidden",
    display: "flex",
    border: "1px solid rgba(0, 0, 0, 0.20)",
    cursor: "pointer",
  };
};
export const getQuestionAlignmentTextStyles = {
  color: "#000",
  fontFamily: "Inter",
  fontSize: "0.875em",
  fontStyle: "normal",
  fontWeight: 600,
  letterSpacing: "0.078125em",
  textTransform: "uppercase",
} as const;
export const alignmentTabContainer = ({ isSelected }) => {
  return {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: isSelected ? "black" : "white",
    color: isSelected ? "white" : "black",
  };
};

export const getOptionWrapperContainerStyles = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "2em",
} as const;

export const optionsContainer = () => {
  return {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  };
};
