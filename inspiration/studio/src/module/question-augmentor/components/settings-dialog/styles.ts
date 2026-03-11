const getSettingDialogContainerStyles = {
  width: "100%",
  display: "flex",
  padding: "1.5em",
  flexDirection: "column" as const,
  alignItems: "flex-start" as const,
  gap: "1.5em",
  alignSelf: "stretch",
  background: "#FFF",
  boxSizing: "border-box" as const,
};

const getNameAndActionContainerStyles = () => {
  return {
    width: "100%",
    display: "flex",
    justifyContent: "center" as const,
    alignItems: "flex-start" as const,
    gap: "1.5em",
    alignSelf: "stretch",
  };
};
const getImageNameStyles = () => {
  return {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center" as const,
    alignItems: "flex-start" as const,
    gap: "1.5em",
    flex: "1 0 0",
    alignSelf: "stretch",
  };
};

const getImageNameTextStyles = () => {
  return {
    width: "100%",
    display: "-webkit-box" as const,
    WebkitBoxOrient: "vertical" as const,
    WebkitLineClamp: 1,
    alignSelf: "stretch",
    overflow: "hidden",
    color: "#000",
    textOverflow: "ellipsis",
    fontFamily: "Inter",
    fontSize: "1.125em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "110%",
    letterSpacing: "0.25px",
  };
};

const getActionContainerStyles = () => {
  return {
    display: "flex",
    alignItems: "center",
  };
};
const getActionButtonStyles = () => {
  return {
    display: "flex",
    height: "2.75em",
    padding: "0px 1em",
    justifyContent: "center",
    alignItems: "center",
    gap: "1em",
    //@to-check box shadow bad ui for button
    //boxShadow: "0px 6px 12px 0px rgba(122, 124, 141, 0.13)",
    border: "none",
    outline: "none",
    cursor: "pointer",
    background: "transparent",
  };
};
const getActionTextStyles = (color) => {
  return {
    color: color,
    textAlign: "center" as const,
    fontFamily: "Inter",
    fontSize: "0.875em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "110%" /* 15.4px */,
    letterSpacing: "0.25px",
    textTransform: "uppercase" as const,
  };
};
const getAlignmentContainerStyles = () => {
  return {
    width: "100%",
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    gap: "1em",
    alignSelf: "stretch",
  };
};
const getAlignmentWrapContainerStyles = () => {
  return {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  } as const;
};
const getHeadingTextStyles = () => {
  return {
    color: "#000",
    fontFamily: "Inter",
    fontSize: "1.125em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "110%" /* 19.8px */,
    letterSpacing: "0.25px",
  };
};
const getAlignmentActionContainerStyles = () => {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };
};
const getAltTextContainerStyles = () => {
  return {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    gap: "0.5em",
    alignSelf: "stretch",
  };
};
const getAugmentorTextFieldStyles = () => {
  return {
    width: "100%",
    padding: "0.625em",
    border: "0.75px solid rgba(0, 0, 0, 0.20)",
    "& textarea": {
      height: "124px",
      color: "#263238 !important",
      fontFamily: "Inter !important",
      fontSize: "1em !important",
      fontStyle: "normal !important",
      fontWeight: 400,
      lineHeight: "110% !important" /* 17.6px */,
      letterSpacing: "0.25px !important",
    },
    "& textarea::placeholder": {
      color: "#607D8B",
    },
    "&:hover": {
      border: "0.75px solid #263238",
    },
  };
};
const getAlignmentIconContainerStyles = () => {
  return {
    display: "flex",
    alignItems: "flex-start",
    gap: "1.5em",
  };
};
const getAlignmentIconsStyles = () => {
  return {
    width: "max-content",
    height: "max-content",
    border: "none",
    padding: 0,
    background: "transparent",
  };
};
const getImagesIconsStyles = {
  width: "6em",
  height: "3.75em",
};
const getTitleStyles = () => {
  return {
    fontFamily: "Helvetica Neue",
    fontWeight: "400",
    fontSize: "1.25em",
    color: "#000000",
    marginLeft: 10,
  };
};
export {
  getSettingDialogContainerStyles,
  getNameAndActionContainerStyles,
  getImageNameStyles,
  getImageNameTextStyles,
  getActionContainerStyles,
  getActionButtonStyles,
  getActionTextStyles,
  getAlignmentContainerStyles,
  getAlignmentWrapContainerStyles,
  getHeadingTextStyles,
  getAlignmentActionContainerStyles,
  getAltTextContainerStyles,
  getAugmentorTextFieldStyles,
  getAlignmentIconsStyles,
  getAlignmentIconContainerStyles,
  getImagesIconsStyles,
  getTitleStyles,
};
