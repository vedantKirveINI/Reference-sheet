const getRadioContainerStyle = ({ style }: any) => {
  return {
    width: "100%",
    minHeight: "1.2em",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: "0.75em",
    textAlign: "center",
    fontFamily: "Helvetica Neue",
    fontStyle: "normal",
    fontSize: "1.5em",
    fontWeight: 400,
    letterSpacing: "0.25px",
    cursor: "pointer",
    ...style,
  } as const;
};
const getInputContainerStyles = () => {
  return {
    position: "relative",
    userSelect: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  } as const;
};
const getRadioInputStyles = () => {
  return {
    position: "absolute" as const,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    opacity: 0,
    cursor: "pointer",
  };
};
const getRadioCircleStyles = (options?: any) => {
  return {
    width: "1.2em",
    height: "1.2em",
    padding: options.isChecked ? 0 : "0.5em",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: options.isChecked ? "" : "0.75px solid rgba(0, 0, 0, 0.2)",
    borderRadius: options.isChecked ? "50%" : "0.25em",
    fontSize: "1em",
  };
};

export {
  getRadioContainerStyle,
  getInputContainerStyles,
  getRadioInputStyles,
  getRadioCircleStyles,
};
