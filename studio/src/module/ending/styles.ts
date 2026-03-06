import { fontSizeMappingForDescription } from "@oute/oute-ds.core.constants";

const styles = {
  container: ({ questionAlignment }) => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: questionAlignment,
      gap: "1.5em",
    } as const;
  },
  iconContainer: {
    cursor: "pointer",
    padding: "0.375em",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "1.5em",
    borderRadius: "0.625em",
    border: "0.046875em solid rgba(0, 0, 0, 0.2)",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(5px)",
    boxSizing: "border-box",
    boxShadow: "0px 0px 0px 0px rgba(122, 124, 141, 0.2)",
    transition: "border 0.3s ease",
  } as const,

  icon: {
    width: "32px",
    height: "32px",
    borderRadius: "0.3em",
  },

  submitButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    // padding: "0.5em 2em",
    gap: "0.625em",
    borderRadius: "0.375em",
    border: "0.75px solid var(--grey-darken-4, #263238)",
    background: "rgba(255, 255, 255, 0.70)",
    color: "#000",
    fontFamily: "Inter !important",
    fontSize: "1em",
    fontStyle: "normal",
    fontWeight: 600,
    letterSpacing: "0.25px",
    textTransform: "uppercase",
    cursor: "pointer",
    minHeight: "20px",
  } as const,
  shareButtonStyle: {
    display: "flex",
    alignItems: "center",
  },
  editableText: {
    color: "#FD622D",
    textDecorationLine: "underline",
    fontStyle: "italic",
    cursor: "pointer",
    fontWeight: 600,
  },
  promotionalText: ({ theme }) =>
    ({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1em",
      textAlign: "center",
      maxWidth: "100%",
      "& p": {
        margin: 0,
        fontSize:
          fontSizeMappingForDescription[theme?.styles?.questionSize] || "1em",
        color: theme?.styles?.description || "#666666",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        width: "100%",
        whiteSpace: "pre-wrap",
        opacity: 0.7,
        fontFamily: theme?.styles?.fontFamily,
      },
    }) as const,

  brandText: ({ theme }) => ({
    fontSize:
      fontSizeMappingForDescription[theme?.styles?.questionSize] || "1em",
    color: theme?.styles?.description || "#666666",
    opacity: 0.7,
    fontFamily: theme?.styles?.fontFamily,
  }),
};

export default styles;
