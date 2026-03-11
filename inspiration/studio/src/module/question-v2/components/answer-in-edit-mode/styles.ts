import { ViewPort } from "@oute/oute-ds.core.constants";

export const styles = {
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row",
    gap: "0.75em", // 12px
    alignSelf: "stretch",
  } as const,
  editBtn: {
    display: "flex",
    width: "2.25em",
    height: "2.25em",
    padding: "0.375em",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.75em",
    borderRadius: "1000px",
    border: "0.047em solid rgba(0, 0, 0, 0.20)",
    background: "rgba(255, 255, 255, 0.80)",
    backdropFilter: "blur(0.625em)",
    cursor: "pointer",
  },
  textContainer: ({ viewPort, theme }) => {
    return {
      width: "100%",
      maxWidth: "85%",
      minWidth: 0,
      display: "flex",
      padding: "1.125em 1.5em",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      alignSelf: "stretch",
      borderRadius: "1.25em 1.25em 0em 1.25em",
      borderRight: "0.047em solid var(--grey-lighten-4, #CFD8DC)",
      borderBottom: "0.047em solid var(--grey-lighten-4, #CFD8DC)",
      borderLeft: "0.047em solid var(--grey-lighten-4, #CFD8DC)",
      background: theme?.styles?.buttons || "rgba(0, 0, 0, 0.70)",
      opacity: "0.7",
      backdropFilter: "blur(1em)",
      overflowWrap: "break-word",
      wordBreak: "break-word",
    } as const;
  },
  text: ({ styles = {}, showFullText = false, theme }) => {
    const answerTheme = {
      fontWeight: theme?.styles?.questionSize === "XS" && "600 !important",
      fontFamily: theme?.styles?.fontFamily,
    };
    return {
      width: "100%",
      minWidth: 0,
      height: "max-content",
      overflow: "visible",
      whiteSpace: "pre-wrap",
      color: theme?.styles?.buttonText || "#FFF",
      fontFamily: '"Helvetica Neue"',
      fontSize: "1.5em", // 24px
      fontStyle: "normal",
      fontWeight: "300",
      margin: "0px",
      padding: "0px",
      overflowWrap: "break-word",
      wordBreak: "break-word",
      ...styles,
      ...answerTheme,
    };
  },

  countryInputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
} as const;
