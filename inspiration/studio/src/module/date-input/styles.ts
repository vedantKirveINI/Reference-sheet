export const styles = {
  containerStyle: (style, error, focus, theme) => {
    return {
      width: "100%",
      position: "relative",
      borderBottom: error
        ? "2px solid rgba(200, 60, 60, 1)"
        : `1px solid ${theme?.styles?.buttons}`,
      ...(focus &&
        !error && { borderBottom: `2px solid ${theme?.styles?.buttons}` }),
      ...style,
    } as const;
  },
  inputStyle: ({ theme }) => {
    return {
      width: "100%",
      opacity: 0.95,
      outline: "none",
      flex: 1,
      fontSize: "1.15em",
      fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
      padding: "0.625em 0em",
      boxSizing: "border-box",
      // color: isCreator ? "rgb(96, 125, 139)" : theme?.styles?.answer,
      color: theme?.styles?.buttons,
    } as const;
  },
  datePickerStyle: (disabled) => {
    return {
      position: "absolute",
      top: "50%",
      right: "10px",
      transform: "translateY(-50%)",
      cursor: disabled ? "default" : "pointer",
      color: "#607D8B",
      display: "flex",
    } as const;
  },
  datePickerIcon: {
    position: "absolute",
  },
  datePickerIconInput: (disabled) => {
    return {
      position: "absolute",
      top: "-10px",
      right: "-25px",
      width: "25px",
      height: "25px",
      opacity: 0,
      cursor: disabled ? "unset" : "pointer",
    } as const;
  },
  customDatePickerPopper: {
    zIndex: "1000 !important",
  },
};
