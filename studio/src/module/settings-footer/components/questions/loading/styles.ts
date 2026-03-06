export const styles = {
  container: {
    margin: "1em 0",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3.31em",
  },
  getInputStyle: () => {
    return {
      height: "1.351em",
      borderRadius: "0.375em",
      background: "transparent",
    };
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75em",
  } as const,
};
