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
  } as const,
  wrapper: {
    width: "100%",
    display: "flex",
    gap: "1em",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "column",
    position: "relative",
  } as const,
  selectContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "row",
    gap: "0.75em",
    boxSizing: "border-box",
    "& input": {
      width: "4em",
      padding: "8px 12px",
    },
  } as const,
};
