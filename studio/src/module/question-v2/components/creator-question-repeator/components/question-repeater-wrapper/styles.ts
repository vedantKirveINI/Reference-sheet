export const styles = {
  getSelectedQuestionContainerStyles: {
    background: "rgba(255, 255, 255, 0.50)",
    opacity: "1",
  },
  getUnSelectedQuestionContainerStyles: {
    background: "rgba(236, 239, 241, 0.50)",
    opacity: "0.50",
  },
  getNoQuestionSelectedQuestionContainerStyles: {
    background: "rgba(236, 239, 241, 0.32)",
  },
  getBorderStyles: ({ isSelected }: { isSelected: boolean }) => {
    if (isSelected) return "0.156em solid #FF6058";

    return "1px solid var(--grey-lighten-4, #CFD8DC)";
  },

  getHoverAnimation: ({ isSelected }: { isSelected: boolean }) => {
    if (isSelected) return {};

    return {
      background: "rgba(236, 239, 241, 0.50)",
      opacity: "1",
    };
  },

  getQuestionContainerStyles: ({
    isNoQuestionSelected,
    isSelected,
  }: {
    isNoQuestionSelected: boolean;
    isSelected: boolean;
  }) => {
    let conditionalStyles = {};

    if (isNoQuestionSelected) {
      conditionalStyles = styles.getNoQuestionSelectedQuestionContainerStyles;
    } else if (isSelected) {
      conditionalStyles = styles.getSelectedQuestionContainerStyles;
    } else {
      conditionalStyles = styles.getUnSelectedQuestionContainerStyles;
    }

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
      outline: styles.getBorderStyles({ isSelected }),
      ...conditionalStyles,
      "& > .MuiButtonBase-root": {
        display: isSelected ? "flex" : "none",
      },
      "&:hover > .MuiButtonBase-root": {
        display: "flex",
      },
      "&:hover": styles.getHoverAnimation({ isSelected }),
    } as const;
  },
  getChipsContainerStyles: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  } as const,
  getAddNewQuestionButtonStyles: {
    display: "none",
    width: "fit-content",
    position: "absolute",
    bottom: "-1em",
    left: "40%",
    backgroundColor: "#FD622D",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      opacity: 0.9,
      backgroundColor: "#FD622D",
    },
  },
} as const;
