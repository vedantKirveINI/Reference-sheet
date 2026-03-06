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
    marginBottom: "2.1em",
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
  inputContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "0.75em",
  },
  noteContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5em",
  },
  getInputStyle: () => {
    return {
      height: "1.351em",
      borderRadius: "0.375em",
      background: "transparent",
    };
  },
  advancedSettingsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "2em",
  },
} as const;
