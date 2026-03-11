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
  switchContainer: {
    flex: 1,
    width: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2em",
  },
  wrapper: {
    width: "100%",
    display: "flex",
    gap: "1em",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "column",
    position: "relative",
  },
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
  },
  textFieldStyles: {
    "& >div": {
      display: "flex",
      flexDirection: "row",
      height: "2.5em",
      overflow: " auto hidden",
      flexWrap: "nowrap !important",
      border: "0.75px solid rgba(0, 0, 0, 0.20)",
      "& fieldset": {
        display: "none",
      },
      "&::-webkit-scrollbar": {
        width: "3px",
        height: "1px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "rgba(83, 83, 83, 0.70)",
        borderRadius: "5px",
        height: "1px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
      },
    },
  },
  autocomplete: {
    option: {
      cursor: "pointer !important",
      display: "flex !important",
      padding: "0.625em !important",
      alignItems: "center !important",
      justifyContent: "flex-start !important",
      gap: "0.75em !important",
      borderRadius: "0.5em !important",
      transition: "all .3s ease !important",
      "&:hover": {
        background: "#DBEDFF !important",
      },
      "& input": {
        width: "1.5em",
        height: "1.5em",
        cursor: "pointer !important",
      },
    },
    getListOptionStyles: () => {
      return {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "0.75em",
      };
    },
  },
} as const;
