const getToolBarContainerStyles = () => {
  return {
    position: "absolute" as const,
    top: 15,
    right: 25,
    display: "flex",
    gap: "12px",
    opacity: 0,
  };
};

export { getToolBarContainerStyles };
