export const styles = {
  container: {
    margin: "1em 0",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3.31em",
  },
  wrapperContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "3em",
  },

  inputContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.75em",
    position: "relative",
  },

  input: () => {
    return {
      height: "1.351em",
      borderRadius: "0.375em",
      background: "transparent",
    };
  },
} as const;
