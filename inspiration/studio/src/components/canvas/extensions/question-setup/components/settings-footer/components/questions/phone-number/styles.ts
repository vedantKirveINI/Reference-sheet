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
} as any;
