export const getEditorStyles = () => {
  return {
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "0.75em",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  };
};

export const getPictureOptionIconWrapperStyles = ({ theme }) => {
  return {
    display: "flex",
    width: "1.5rem",
    height: "1.5rem",
    padding: "0.18794rem",
    "flex-direction": "column",
    "justify-content": "center",
    "align-items": "center",
    "border-radius": "0.46988rem",
    border: "0.752px solid var(--stroke, rgba(0, 17, 106, 0.20))",
    background: "var(--white, #FEFEFF)",
    fontFamily: theme?.styles?.fontFamily || "inherit",
  } as const;
};
