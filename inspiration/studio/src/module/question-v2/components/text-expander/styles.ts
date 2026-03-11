export const styles = {
  textContainer: {
    width: "100%",
    minWidth: 0,
    overflowWrap: "break-word",
    wordBreak: "break-word",
  },
  collapsedText: {
    display: "-webkit-box",
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
    overflowWrap: "break-word",
    wordBreak: "break-word",
  },
  text: ({ theme, styles = {} }) => {
    {
      const answerTheme = {
        fontWeight: theme?.styles?.questionSize === "XS" && "600 !important",
        fontFamily: theme?.styles?.fontFamily,
      };
      return {
        width: "100%",
        minWidth: 0,
        color: theme?.styles?.buttonText || "#FFF",
        fontFamily: '"Helvetica Neue"',
        fontSize: "1.5em",
        fontStyle: "normal",
        fontWeight: "300",
        margin: "0px",
        padding: "0px",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        ...styles,
        ...answerTheme,
      };
    }
  },
};
