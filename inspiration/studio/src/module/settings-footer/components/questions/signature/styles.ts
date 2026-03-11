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

  colorPickerContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.75em",
    "& > div": {
      width: "100%",
      padding: "1.52em",
      borderRadius: "0.375em",
    },
  } as const,
};
