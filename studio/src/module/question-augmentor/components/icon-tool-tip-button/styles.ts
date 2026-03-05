const getIconWrapperStyles = () => {
  return {
    position: "relative" as const,
    display: "flex",
    width: "2.5em",
    height: "2.5em",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    borderRadius: "10px",
    border: "0.75px solid rgba(0, 0, 0, 0.20)",
    background: "#212121",
    boxShadow: "0px 2px 6px 0px rgba(122, 124, 141, 0.20)",
    cursor: "pointer",
    "&:hover .tooltip": {
      opacity: 1,
    },
  };
};

const getTooltipStyles = (option) => {
  const { style } = option;
  return {
    position: "absolute" as const,
    padding: "4px 8px",
    fontSize: "12px",
    borderRadius: "6px",
    backgroundColor: "rgba(0, 0, 0, 0.80)",
    color: "white",
    bottom: !!style ? "107%" : "-35px",
    left: "auto",
    textTransform: "capitalize" as const,
    whiteSpace: "nowrap" as const,
    opacity: 0,
  };
};

export { getIconWrapperStyles, getTooltipStyles };
