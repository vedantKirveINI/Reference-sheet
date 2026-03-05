export const getContainerStyles = () => ({
  display: "flex",
  alignItems: "center",
  padding: "0.625rem",
  boxSizing: "border-box" as const,
  height: "100%",
  gap: "0.5rem",

  svg: {
    verticalAlign: "middle",
    margin: "0 0.25rem",
  },
});
