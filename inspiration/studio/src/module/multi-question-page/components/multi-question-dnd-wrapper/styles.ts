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
  getBorderStyles: ({
    isSelected,
    isCreator,
  }: {
    isSelected: boolean;
    isCreator: boolean;
  }) => {
    if (!isCreator) return undefined;

    if (isSelected) return "0.156em solid #FF6058";

    return "1px solid var(--grey-lighten-4, #CFD8DC)";
  },

  getHoverAnimation: ({
    isSelected,
    isCreator,
  }: {
    isSelected: boolean;
    isCreator: boolean;
  }) => {
    if (!isCreator) return {};

    if (isSelected) return {};

    return {
      background: "rgba(236, 239, 241, 0.50)",
      opacity: "1",
    };
  },

  getQuestionContainerStyles: ({
    isNoQuestionSelected,
    isSelected,
    isCreator,
  }: {
    isNoQuestionSelected: boolean;
    isSelected: boolean;
    isCreator: boolean;
  }) => {
    let conditionalStyles = {};

    if (isCreator) {
      if (isNoQuestionSelected) {
        conditionalStyles = styles.getNoQuestionSelectedQuestionContainerStyles;
      } else if (isSelected) {
        conditionalStyles = styles.getSelectedQuestionContainerStyles;
      } else {
        conditionalStyles = styles.getUnSelectedQuestionContainerStyles;
      }
    }
    return {
      position: "relative",
      cursor: isCreator ? "pointer" : "default",
      width: "100%",
      display: "flex",
      padding: isCreator ? "1.5em" : " 0.75rem 1.5rem",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "1em",
      alignSelf: "stretch",
      borderRadius: "0.75em",
      backdropFilter: isCreator ? "blur(0.75em)" : "blur(0em)",
      outline: styles.getBorderStyles({ isCreator, isSelected }),
      ...conditionalStyles,
      "& > .MuiButtonBase-root": {
        display: isSelected ? "flex" : "none",
      },
      "&:hover > .MuiButtonBase-root": {
        display: "flex",
      },
      "&:hover": styles.getHoverAnimation({ isSelected, isCreator }),
    } as const;
  },
  getDragIconStyles: {
    position: "absolute",
    top: "50%",
    left: "95.5%",
    transform: "translate(-50%, -95%)",
    cursor: "grab",
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
