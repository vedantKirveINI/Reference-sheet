export const getContainerStyles = () => {
  return {
    padding: "1em",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    overflow: "auto",
    height: "100%",
    ...getScrollBarStyles(),
    "& *": {
      boxSizing: "border-box",
    },
  } as const;
};

export const accordionStyle = {
  container: {
    background: "#ffffff",
    borderRadius: "12px !important",
    border: "0.75px solid #CFD8DC !important",
    height: "fit-content !important",
    maxHeight: "fit-content !important",
    overflow: "visible",
    "::before": {
      opacity: 0,
    },
  },
  summary: {
    background: "#ECEFF1 !important",
    border: "none !important",
    borderBottom: "0.75px solid #CFD8DC !important",
    padding: "12px 20px !important",
    borderRadius: "12px 12px 0 0 !important",
    gap: "12px",
    ".MuiAccordionSummary-expandIconWrapper": {
      "&.Mui-expanded": {
        transform: "rotate(90deg)",
      },
    },
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
    padding: "16px 20px",
    display: "grid",
    gridAutoRows: "max-content",
    gap: "24px",
    boxSizing: "border-box",
    overflow: "hidden",
    "& *": {
      boxSizing: "border-box",
    },
  } as const;
};

const getScrollBarStyles = () => {
  return {
    scrollBehavior: "smooth" as const,
    "&::-webkit-scrollbar": {
      width: 4,
      height: 4,
    },
    "&::-webkit-scrollbar-track": {
      background: "none",
      borderRadius: 10,
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#888",
      borderRadius: 20,
      height: "5px" as const,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#555",
    },
  };
};

export const getSeparatorStyles = () => {
  return {
    minHeight: "0.075em",
    width: "100%",
    background: "rgba(0, 0, 0, 0.1)",
  };
};
