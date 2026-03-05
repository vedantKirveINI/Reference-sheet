const commonStyles = (theme?: any) => {
  return {
    color: theme?.styles?.questions || "#263238",
    opacity: 0.9,
    fontFamily: theme?.styles?.fontFamily || "Noto serif",
    fontStyle: "normal",
  };
};
export const getAddChoiceStyles = ({ theme }) => {
  return {
    float: "right",
    textDecorationLine: "underline",
    padding: "0.375em",
    cursor: "pointer",
    fontSize: "1.1em",
    ...commonStyles(theme),
  } as const;
};

export const getContainerStyles = ({ theme }) => {
  return {
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    fontSize: "1.25em",
    ...commonStyles(theme),
  } as const;
};
