export const containerStyles = () => {
  return {
    boxSizing: "border-box" as const,
    padding: "1.125em",
    width: "100%",
    display: "flex",
    fontSize: "12px",
    flexDirection: "column" as const,
    height: "100%",
    gap: "1em",
    minHeight: "500px",
  };
};

export const getImagePickerContainerStyles = {
  width: "100%",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  flexDirection: "column",
  gap: "1em",
  fontSize: 14,
} as const;

export const getUploadContainerStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1em",
  alignSelf: "stretch",
} as const;

export const subTitleStyles = () => {
  return {
    color: "#607D8B",
    fontFamily: "Inter",
    fontSize: "1em",
    fontStyle: "normal",
    fontWeight: 400,
    letterSpacing: 0.15,
    marginTop: "0.75em",
  };
};

export const getBackIconStyles = () => {
  return {
    width: "1.5em",
    height: "1.5em",
    color: "#90A4AE",
  };
};

export const getDilogTitleStyles = () => {
  return {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center" as const,
  };
};

export const getTitleStyles = () => {
  return {
    fontFamily: "Helvetica Neue",
    fontWeight: "400",
    fontSize: "1.25em",
    color: "#000000",
    marginLeft: 10,
  };
};
