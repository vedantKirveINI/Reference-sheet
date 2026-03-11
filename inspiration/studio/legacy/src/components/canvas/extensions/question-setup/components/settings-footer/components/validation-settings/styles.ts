export const getValidationContainerStyles = {
  width: "100%",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: "0.75em",
  flexDirection: "column",
} as const;

export const getValidationHeadingStyles = {
  color: "#000",
  fontFamily: "Inter",
  fontSize: "0.875em",
  fontStyle: "normal",
  fontWeight: 400,
  letterSpacing: "0.015625em",
};

export const getTextAreaStyles = {
  width: "100%",
  padding: "0.625em",
  borderRadius: "12px",
  //border: "0.75px solid rgba(0, 0, 0, 0.20)",
  background: "#FFF",
  boxShadow: "0px 0px 0px 0px rgba(122, 124, 141, 0.20)",
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
};

export const accessKeyInputStyles = {
  width: "100%",
  paddingRight: 0,
};
