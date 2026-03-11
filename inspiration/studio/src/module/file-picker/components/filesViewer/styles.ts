export const styles = {
  container: (isLengthExceeded: boolean, error: boolean) => {
    const border = error
      ? "2px solid #C83C3C"
      : "0.75px solid rgba(0, 0, 0, 0.20)";
    return {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1em",
      borderRadius: isLengthExceeded ? "12px" : "12px 12px 0px 0px",
      border: border,
      borderBottom: isLengthExceeded ? border : "none",
      background: "rgba(255, 255, 255, 0.70)",
      backdropFilter: "blur(10px)",
      padding: "1.25em 1em",
    } as const;
  },
  file: {
    width: "100%",
    display: "flex",
    boxSizing: "border-box",
    gap: "1em",
    borderRadius: "8px",
    border: "0.75px solid #CFD8DC",
    background: "#FFF",
    padding: "0.5em",
  } as const,
  wrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "1em",
    overflow: "hidden",
    "& img": {
      "-webkit-user-drag": "none",
      "-khtml-user-drag": "none",
      "-moz-user-drag": "none",
      "-o-user-drag": "none",
      "user-drag": "none",
      "user-select": "none",
    } as const,
  },

  endWrapper: {
    width: "20%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  size: {
    color: "#607D8B",
    fontFamily: "Inter",
    fontSize: "0.875em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "18px",
  },
  fileName: {
    color: "#000",
    fontFamily: "Inter",
    fontSize: "1em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "18px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
