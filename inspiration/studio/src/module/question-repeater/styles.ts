const getQuestionRepeatorStyles = () => {
  return {
    display: "flex",
  };
};

const getTextStyles = (styles = {}) => {
  return {
    fontSize: "1.1em",
    fontFamily: "Helvetica Neue",
    ...styles,
  };
};

const fillerViewStyles = {
  getRootStyles: () => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "1em",
      boxSizing: "border-box",
    } as const;
  },
  getValuesRootStyles: () => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "1em",
    } as const;
  },
  getGroupRootStyles: () => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "1em",
    } as const;
  },
  getChildrenRootStyles: () => {
    return {
      width: "100%",
      marginLeft: "1em",
      display: "flex",
      flexDirection: "column",
      gap: "0.5em",
    } as const;
  },
  getInputContainerStyles: () => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "0.5em",
    } as const;
  },
};

export { getQuestionRepeatorStyles, fillerViewStyles, getTextStyles };
