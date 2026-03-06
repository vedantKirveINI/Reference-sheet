export const styles = {
  getContainerStyles: () => {
    return {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      alignItems: "center",
      justifyContent: "center",
    } as const;
  },
  labelWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  } as const,
};
