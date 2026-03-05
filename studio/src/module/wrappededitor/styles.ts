const getBorderStyle = ({ isSelected, isValid, disabled }) => {
  if (!disabled) {
    return isValid ? "1px solid rgba(0, 0, 0, 0.20)" : "1px solid #FF5252";
  }

  return isSelected ? "1px solid transparent" : "1px solid rgba(0, 0, 0, 0.20)";
};

const getMcqOptionContainerStyle = ({
  style,
  isSelected,
  isValid,
  disabled,
  theme,
}) => {
  const buttonColor = theme?.styles?.buttons;
  return {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start" as const,
    alignItems: "stretch" as const,
    gap: "0.25rem",
    cursor: disabled ? ("not-allowed" as const) : ("pointer" as const),
    maxWidth: "100%",
    minHeight: "2.25rem",
    fontWeight: 400,
    lineHeight: "140%",
    letterSpacing: 0.25,
    padding: "0.375rem 0.5rem",
    borderRadius: "0.375rem",
    border: getBorderStyle({ isSelected, isValid, disabled }),
    borderColor:
      isSelected && isValid
        ? (theme?.styles?.buttons ?? "currentColor")
        : "rgba(0, 0, 0, 0.20)",
    background: `${buttonColor}1A`,
    backgroundFilter: "blur(10px)" as const,
    boxSizing: "border-box" as const,
    backgroundPosition: "center" as const,
    backgroundSize: "0%",
    opacity: disabled ? 0.5 : 1,
    transition:
      "background .8s ease,border .3s ease,outline .3s ease,box-shadow .3s ease, ",
    ...style,
  };
};

const getWrapperStyles = () => {
  return {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start" as const,
    alignItems: "center" as const,
    gap: "0.5rem",
  };
};

const getIconStyle = ({
  backgroundColor,
  theme,
  styles = {},
  inputType,
}: any) => {
  return {
    display: "flex",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    width: "1.75rem",
    height: "1.75rem",
    flexShrink: 0,
    borderRadius: inputType === "Radio" ? "50%" : "0.25rem",
    borderWidth: "0.75px",
    borderStyle: "solid" as const,
    color: theme?.styles?.buttonText,
    borderColor: "rgba(0, 0, 0, 0.2)",
    textAlign: "center" as const,
    fontFamily: "Inter !important",
    padding: "0.125rem 0.25rem",
    fontSize: "0.875rem",
    fontStyle: "normal",
    fontWeight: "400",
    backgroundColor: theme?.styles?.buttons || backgroundColor || "#fff",
    ...styles,
  };
};

const getMcqOptionEditorStyle = ({ theme }) => {
  return {
    minWidth: "0",
    maxWidth: "100%",
    outline: "none",
    border: "none",
    transition: "all .3s ease",
    color: theme?.styles?.buttons,
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "140%",
    letterSpacing: "0.015625em",
    cursor: "inherit",
    background: "transparent",
    fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
    fontSize: "0.875rem",
  };
};

const getMCQSelectedStyles = (inputType, theme) => {
  return {
    display: "flex",
    width: "1.75rem",
    height: "1.75rem",
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: inputType === "Checkbox" ? "0" : "0.125rem 0.25rem",
    borderRadius: inputType === "Checkbox" ? "0.25rem" : "1000px",
    border:
      inputType === "Checkbox"
        ? "0.75px solid rgba(0, 0, 0, 0.20)"
        : `2px solid ${theme?.styles?.buttons}`,
    background:
      inputType === "Checkbox" ? theme?.styles?.buttons : "transparent",
    boxShadow: "0px 0px 0px 0px rgba(0, 0, 0, 0.00) inset",
  } as const;
};

const getErrorStyles = () => {
  return {
    color: "#FF6D6D",
    fontSize: "0.75rem",
    fontWeight: "600",
    lineHeight: "1.2",
    letterSpacing: "0.25px",
    textAlign: "left",
    marginLeft: "2.25rem",
    marginBottom: "0.25rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  } as const;
};

export {
  getIconStyle,
  getMcqOptionContainerStyle,
  getMcqOptionEditorStyle,
  getWrapperStyles,
  getMCQSelectedStyles,
  getErrorStyles,
};

export const INPUT_CLASSES = "input-placeholder-themed input-selection-highlight";
export const HOVER_CLASS = "hover-opacity";
