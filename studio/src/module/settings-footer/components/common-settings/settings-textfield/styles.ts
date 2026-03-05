export const styles = {
  getInputWrapperContainerStyle: () => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: "0.85em",
      position: "relative" as const,
    };
  },
};
