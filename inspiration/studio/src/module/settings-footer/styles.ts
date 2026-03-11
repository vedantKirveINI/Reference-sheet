export const getContainerStyles = () => {
  return {
    padding: "1em",
    display: "flex",
    flexDirection: "column",
    gap: "1em",
    overflow: "auto",
    height: "100%",
  } as const;
};

export const accordionStyle = {
  container: {
    background: "#ffffff",
    borderRadius: "0px !important",
    border: "none !important",
    height: "fit-content !important",
    maxHeight: "fit-content !important",
    overflow: "visible",
  },
  summary: {
    background: "#ffffff",
    border: "none !important",
  },
};

export const odsWrapperStyles = (viewport) => {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
  };
};

export const wrapperContainer = () => {
  return {
    width: "100%",
    padding: "0.75em 0.75em",
    display: "grid",
    gridAutoRows: "max-content",
    gap: "1.5em",
    boxSizing: "border-box",
    overflow: "hidden",
  } as const;
};

export const getSeparatorStyles = () => {
  return {
    minHeight: "0.075em",
    width: "100%",
    background: "rgba(0, 0, 0, 0.1)",
  };
};

export const SCROLLBAR_CLASS = "scrollbar-thin";
