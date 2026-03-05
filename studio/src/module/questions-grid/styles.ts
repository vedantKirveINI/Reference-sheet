export const styles = {
  container: (theme) => {
    const fontFamily = theme?.styles?.fontFamily || "Helvetica Neue";
    return {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily,
    } as const;
  },
  tableWrapper: {
    width: "100%",
    borderRadius: "0.75em",
    overflow: "auto",
  } as const,
  tableContainer: {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: "0.75em",
    alignSelf: "flex-start",
    overflow: "hidden",
  } as const,
  headerContainer: {
    backgroundColor: "#f0f4f8",
    color: "#333",
  },
  headerText: {
    padding: "1em",
    textAlign: "left",
    fontSize: "1em",
  } as const,
  rowContainer: (index) => {
    return {
      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
    };
  },
  dataContainer: {
    padding: "10px",
    display: "flex",
    alignItems: "center",
  },
  trashIconStyle: {
    color: "#ff0000",
    width: "1.5em",
    height: "1.5em",
    cusror: "pointer",
  },

  addRowIconStyle: {
    color: "#007BFF",
    width: "1.5em",
    height: "1.5em",
    backgroundColor: "#fff",
    borderRadius: "50%",
  },
  addColumnIconStyle: {
    color: "#007BFF",
    width: "1.5em",
    height: "1.5em",
    cursor: "pointer",
  },
  textFieldStyle: {
    minWidth: "7em",
    height: "1em",
    "& div": { padding: "0" },
    "& input": {
      padding: "0",
      outline: "none",
      fontWeight: "bold",
      fontSize: "1em",
      letterSpacing: "0",
    },
    "& fieldset": {
      border: "none",
    },
  },
};

export const SCROLLBAR_CLASS = "scrollbar-thin";
