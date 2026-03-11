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
  innerContainer: {
    width: "50%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "column",
    gap: "2em",
  },
  autocompleteContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "0.75em",
    position: "relative",
  },
  multipleAutocompleteContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "0.5em",
  },
} as const;
