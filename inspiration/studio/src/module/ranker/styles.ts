export const styles = {
  container: ({ isCreator, theme }: { isCreator: boolean; theme: any }) => {
    return {
      cursor: "pointer",
      width: "100%",
      marginLeft: "2px",
      display: "flex",
      alignItems: "center",
      gap: "0.5em",
    };
  },
  rankerContainer: ({
    isInputFocus,
    isCreator,
    isCharLimitExceeded,
    theme,
  }: {
    isInputFocus: boolean;
    isCreator: boolean;
    isCharLimitExceeded: boolean;
    theme: any;
  }) => {
    const buttonColor = theme?.styles?.buttons;

    return {
      overflow: "hidden",
      display: "flex",
      alignItems: "flex-start",
      padding: "0.875em 1em",
      gap: "0.75em",
      borderRadius: "0.375em",
      outline: isCharLimitExceeded
        ? "2px solid #FF5252"
        : isCreator && isInputFocus
          ? `2px solid ${theme?.styles?.buttons}`
          : `0.75px solid ${theme?.styles?.buttons}`,
      background: `${buttonColor}1A`,
      backdropFilter: "blur(10px)",
      transition: "outline .05s ease",
    };
  },
  dropDownContainer: {
    width: "4.0625em",
    display: "flex",
    paddingRight: "0.5em",
    alignItems: "center",
    gap: "0.375em",
    borderRight: "1px solid #B0BEC5",
    height: "1.75em",
  },
  text: {
    width: "1.75em",
    color: "#000",
    textAlign: "center",
    fontFamily: "Helvetica Neue",
    fontSize: "1.25em",
    fontStyle: "normal",
    fontWeight: 400,
    letterSpacing: "0.25px",
  },
  textarea: (theme) => {
    return {
      display: "flex",
      alignItems: "center",
      flex: 1,
      cursor: "pointer",
      background: "transparent",
      width: "100%",
      margin: "0",
      outline: "none",
      border: "none",
      color: theme?.styles?.buttons,
      fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
      fontSize: "1.25em",
      fontStyle: "normal",
      fontWeight: 400,
      letterSpacing: "0.015625em",
      resize: "none",
      overflow: "hidden",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      minHeight: "1.6em",
      boxSizing: "border-box",
    };
  },
  deleteContainer: {
    padding: "0.25em",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "100%",
    outline: "0.75px solid rgba(0, 0, 0, 0.20)",
    background: "rgba(255, 255, 255, 0.80)",
    backdropFilter: "blur(10px)",
    transition: "display ease .3s,border ease .3s",
  },
  ripple: {
    position: "absolute" as const,
    width: 0,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    transition: "all .4s ease 0s",
  },

  errorTextContainerStyle: {
    minWidth: "17em",
    maxWidth: "25em",
  },

  errorMessage: {
    color: "red",
    fontSize: "0.875em",
    fontStyle: "normal",
    letterSpacing: "0.25px",
    display: "flex",
    flexDirection: "column",
    marginTop: "1em",
    marginBottom: "0.5em",
    alignItems: "flex-start",
    fontWeight: "600",
    lineHeight: "1.2em",
  },
} as any;

export const INPUT_CLASSES = "input-placeholder-themed input-selection-highlight";
export const HOVER_CLASS = "hover-opacity";
