export const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    minHeight: "400px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5rem",
    textAlign: "center",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderTop: "4px solid",
    borderRadius: "50%",
  },
  title: {
    margin: "0px",
    fontSize: "1.5rem",
    fontWeight: "500",
    letterSpacing: "0.02em",
  },
  subtitle: {
    margin: "0px",
    fontSize: "1rem",
    fontWeight: "400",
    color: "#666",
    letterSpacing: "0.01em",
  },
} as const;
