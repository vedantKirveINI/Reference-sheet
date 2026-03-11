import { ViewPort } from "@oute/oute-ds.core.constants";

export const styles = {
  container: {
    margin: "1em 0",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3.31em",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75em",
    position: "relative",
  },

  wrapperContainer: {
    minWidth: "20rem",
    display: "flex",
    flexDirection: "column",
    gap: "3em",
  },

  dateFormatWrapper: {
    display: "flex",
    flexDirection: "row",
    gap: "1em",
  },

  autocompleteWrapper: {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "0.85em",
  } as const,

  paper: {
    overflowX: "hidden",
    border: "0.75px solid rgba(0, 0, 0, 0.20)",
    borderRadius: "0.75em",
    marginTop: "0.2em",
    marginBottom: "0.2em",
    boxShadow: "0px 4px 8px 0px rgba(122, 124, 141, 0.20)",
  },
  datesContainer: {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: "0.85em",
    position: "relative",
  },
  dateInput: {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(16px)",
    border: "0.70px solid #CFD8DC",
    borderRadius: "0.375em !important",
    padding: "0em 1em",
  },
} as const;
