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

  rangeContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1em",
    paddingLeft: "1px",
    position: "relative",
  },

  rangeWrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "1em",
    paddingLeft: "1px",
  },
  getInputStyle: () => {
    return {
      height: "1.351em",
      borderRadius: "0.375em",
      background: "transparent",
    };
  },

  odsContainer: () => {
    return {
      width: "23.25em",
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      justifyContent: "flex-start",
      gap: "0.75em",
    } as const;
  },
} as const;
