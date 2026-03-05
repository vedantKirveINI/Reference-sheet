export const styles = {
  getBorderStyles: () => {
    return "1px solid var(--grey-lighten-4, #CFD8DC)";
  },

  getHoverAnimation: () => {
    return {
      background: "rgba(236, 239, 241, 0.50)",
      opacity: "1",
    };
  },

  getQuestionContainerStyles: () => {
    return {
      position: "relative",
      cursor: "pointer",
      width: "100%",
      display: "flex",
      padding: "1.5em",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "1em",
      alignSelf: "stretch",
      borderRadius: "0.75em",
      backdropFilter: "blur(0.75em)",
      outline: styles.getBorderStyles(),

      "& > .MuiButtonBase-root": {
        display: "none",
      },
      "&:hover > .MuiButtonBase-root": {
        display: "flex",
      },
      "&:hover": styles.getHoverAnimation(),
    } as const;
  },
} as const;
