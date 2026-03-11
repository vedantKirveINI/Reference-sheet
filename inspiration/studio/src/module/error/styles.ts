export const styles = {
  container: {
    display: "flex",
    padding: "0.5em 1em",
    gap: ".5em",
    borderRadius: "0.5em",
    background: "#FFF",
    alignItems: "center",
    boxShadow: "0px 2px 4px 0px rgba(122, 124, 141, 0.20)",
  },
  text: {
    margin: 0,
    color: "var(--error, #FF5252)",
    fontFamily: "Helvetica Neue, sans-serif",
    fontSize: "1.125em",
    fontStyle: "normal",
    fontWeight: 500,
    letterSpacing: "0.015625em",
  },
} as const;
