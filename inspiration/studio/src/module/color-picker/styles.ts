const getColorPickerContainerStyles = (style) => {
  return {
    display: "flex",
    minWidth: "7.375em",
    width: "max-content",
    padding: "0.2em 0.5em",
    alignItems: "center" as const,
    gap: "0.75em",
    borderRadius: "0.75em",
    border: "0.75px solid rgba(0, 0, 0, 0.20)",
    cursor: "pointer",
    height: "2.5em",
    ...style,
  };
};

const getInputWrapperStyles = () => {
  return {
    position: "relative",
    padding: "0",
    width: "1.5em",
    height: "1.5em",
    backgroundColor: "transparent",
    borderRadius: "1000px",
    border: "0.75px solid rgba(0, 0, 0, 0.20)",
    opacity: 0.9,
  } as const;
};

const getInputStyles = {
  position: "absolute",
  zIndex: -1,
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  opacity: 0,
} as const;

const getColorCodeTextStyles = () => {
  return {
    textTransform: "uppercase",
    color: "#000000",
    fontFamily: "Helvetica Neue",
    fontSize: "1em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "110%" /* 15.4px */,
    letterSpacing: "0.25px",
    margin: "0px",
  };
};

export {
  getColorPickerContainerStyles,
  getInputStyles,
  getInputWrapperStyles,
  getColorCodeTextStyles,
};
