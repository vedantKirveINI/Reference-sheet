export const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: ".5rem",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  title: {
    margin: "0px",
    fontSize: "1.5em",
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: "0.1em",
    color: "#000",
  },
  subTitle: {
    margin: "0px",
    fontSize: "1.2em",
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: "0.1em",
    color: "#000",
    opacity: 0.5,
  },
  loader: {
    height: "4px",
    backgroundColor: "#514b82",
  },
} as const;
