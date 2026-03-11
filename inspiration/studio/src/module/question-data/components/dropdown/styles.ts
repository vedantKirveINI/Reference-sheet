export const getMainContainerStyles = () => {
  return {
    padding: "0.625em 1em",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
    gap: "1.5em",
    width: "100%",
  } as const;
};

export const getButtonContainerStyles = () => {
  return {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "1.5em",
    position: "absolute",
    bottom: "0.625em",
    right: "0.625em",
  } as const;
};

export const getInputWrapperStyles = () => {
  return {
    margin: "1em 0",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "1em",
    marginTop: "0.5em",
  } as const;
};

export const getODSRadioGroupStyles = () => {
  return {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "0.5rem",
    width: "100%",
    paddingTop: "0.7rem",
    paddingLeft: "1rem",
    marginRight: "0",
  } as const;
};

export const getSwitchWrapper = {
  width: "100%",
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  gap: "0.5em",
  marginTop: 10,
} as const;

export const getLabelStyles = {
  color: "#263238",
  fontFamily: "Inter",
  fontSize: "1em",
  fontStyle: "normal",
  fontWeight: 400,
  letterSpacing: "0.03125em",
  textWrap: "nowrap",
} as const;

export const getLabelSubTextStyles = () => {
  return {
    whiteSpace: "wrap",
    fontFamily: "Inter",
    fontSize: "0.85rem",
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: "normal",
    letterSpacing: "0.07813rem",
    paddingTop: "0.3rem",
  } as const;
};

export const getFormcontollStyle = (
  isSelected: boolean,
  isDynamic: boolean
) => {
  return {
    maxWidth: "25rem",
    display: "flex",
    flex: 1,
    background: isSelected ? "#212121" : "#eceff1",
    borderRadius: "0.375rem",
    alignItems: "self-start",
    fontSize: "1rem",
    fontWeight: "600",
    letterSpacing: "0.07813rem",
    padding: "0.6rem 0.1rem",
    marginRight: isDynamic ? "0" : undefined,
    paddingRight: isDynamic ? "0.69rem" : undefined,
  };
};

export const getRadioStyles = () => {
  return {
    color: "#90a4ae",
    "&.Mui-checked": {
      color: "#fff",
    },
    height: "1.5rem",
    width: "1.5rem",
    paddingRight: "1.3rem",
    paddingLeft: "1.3rem",
    paddingTop: "1.1rem",
  };
};

export const dynamicLabelStyles = () => {
  return {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    marginTop: 10,
  } as const;
};

export const hintText = {
  color: "#90a4ae",
  fontFamily: "Inter",
  fontSize: "0.85rem",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: "normal",
  letterSpacing: "0.07813rem",
} as const;
