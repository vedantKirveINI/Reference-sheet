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
  selectionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85em",
  },
  selectionTypeContainer: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "0.85em",
  },
} as const;
