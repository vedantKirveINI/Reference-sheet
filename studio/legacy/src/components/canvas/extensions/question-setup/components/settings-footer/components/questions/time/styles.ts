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

  inputStyle: () => {
    return {
      flex: 1,
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(16px)",
      opacity: 0.95,
      outline: "none",
      border: "0.75px solid rgba(0, 0, 0, 0.20)",
      borderRadius: "0.375em",
      padding: "0 1em",
      boxSizing: "border-box",
      color: "#000",
      "::placeholder": {
        color: "#607D8B",
        opacity: 1,
      },
    };
  },
  inputWrapperContainer: () => {
    return {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: "0.85em",
    } as const;
  },
} as const;
