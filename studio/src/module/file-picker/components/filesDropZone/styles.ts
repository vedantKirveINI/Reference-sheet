export const styles = {
  container: ({ style, error, length }: any) => {
    const border = error
      ? "2px solid #C83C3C"
      : "0.75px solid rgba(0, 0, 0, 0.20)";
    return {
      width: "100%",
      height: "15.5em",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      alignItems: "center",
      gap: "1em",
      border: border,
      borderTop: length > 0 ? "0.75px solid rgba(0, 0, 0, 0.20)" : border,
      borderRadius: "0.75em",
      background: "rgba(255, 255, 255, 0.70)",
      backdropFilter: "blur(10px)",
      padding: "1.25em 1em",
      boxSizing: "border-box" as const,
      ...style,
    } as const;
  },
  fileUpload: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.2em",
  } as const,
  fileInput: (isCreator: boolean) => {
    return {
      textDecorationLine: "underline",
      cursor: "pointer",
      color: isCreator ? "#263238" : "#002BE4",
    } as const;
  },

  textWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  } as const,

  text: {
    color: "#263238",
    fontFamily: "Inter",
    fontSize: "1.25em",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "150%",
  },
  orText: {
    color: "#607D8B",
    marginLeft: "0.2em",
    fontWeight: 400,
    fontFamily: "Inter",
    fontSize: "1.25em",
    fontStyle: "normal",
    lineHeight: "150%",
  },
};
