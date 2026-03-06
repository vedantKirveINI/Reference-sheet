export const optionContainer = (styles) => {
  return {
    width: "40%",
    display: "flex",
    alignItems: "center",
    gap: "0.75em",
    ...styles,
  };
};

export const optionTitle = () => {
  return {
    color: "#263238",
    fontFamily: "Inter",
    fontSize: "1em",
    fontStyle: "normal",
    fontWeight: 400,
    letterSpacing: "0.03125em",
  };
};
