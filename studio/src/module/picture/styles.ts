
const getPictureOptionGroupStyles = ({ alignment }) => {
  return {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(12.25em, 12.25em))",
    gap: "0.625em",
    columnGap: "0.625em",
    justifyContent: alignment,
  };
};

const getCrossIconStyles = (): CSSObject => ({
  position: "absolute",
  right: "-0.5em",
  top: "-0.5em",
  background: "rgb(171, 171, 175)",
  opacity: 0,
  cursor: "pointer",
  pointerEvents: "none",
  borderRadius: "50%",
  width: "1.25em",
  height: "1.25em",
  display: "grid",
  placeItems: "center",
});

const getPictureOptionStyles = ({ isSelected, theme }) => {
  return {
    position: "relative",
    display: "grid",
    gridTemplateRows: "min-content auto",
    alignItems: "flex-start",
    gap: "0.5em",
    padding: "0.5em",
    border: "0.752px solid var(--stroke, rgba(0, 17, 106, 0.20))",
    boxShadow: isSelected ? `0 0 0 2px ${theme?.styles?.buttons}` : "none",
    background: "var(--hover-light, rgba(0, 17, 106, 0.10))",
    borderRadius: "0.5em",
    cursor: "pointer",
  } as const;
};

export {
  getPictureOptionGroupStyles,
  getCrossIconStyles,
  getPictureOptionStyles,
};
