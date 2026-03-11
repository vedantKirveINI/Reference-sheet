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
  switchContainer: {
    flex: 1,
    width: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2em",
  },
  getInputWrapperContainerStyle: () => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: "0.85em",
      position: "relative",
    } as const;
  },

  getInputStyle: () => {
    return {
      width: "100%",
      height: "1.351em",
      borderRadius: "0.375em",
      background: "transparent",
    };
  },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0em",
    justifyContent: "space-between",
  },
} as const;
