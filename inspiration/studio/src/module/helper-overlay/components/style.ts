export const getOverlayStyle = () => {
  return {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(18, 18, 18, 0.83)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    transition: "all 0.3s ease-in-out",
  } as const;
};

export const getOverlayCloseContainerStyle = () => {
  return {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    gap: ".75rem",
    top: "1.69rem",
    right: "1.69rem",
    fontSize: "1.5rem",
    fontWeight: 500,
    lineHeight: "2.25rem",
    color: "#fff",
    zIndex: 100,
  } as const;
};

export const getWrapperStyle = () => {
  return {
    width: "100%",
    height: "100%",
    background: "#fff",
    zIndex: 100,
    borderRadius: "0.375em",
    padding: "0.175em",
    position: "relative",
    // pointerEvents: "none",
    // overflowY: "auto",
  } as const;
};

export const getHelperStyle = ({ direction }) => {
  const getFlexDirection = (direction) => {
    if (direction === "top") {
      return "column";
    }
    if (direction === "bottom") {
      return "column-reverse";
    }
    if (direction === "right") {
      return "row-reverse";
    }
    return "row";
  };
  return {
    width: "100%",
    position: "absolute",
    display: "flex",
    flexDirection: getFlexDirection(direction),
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "10px",
  } as const;
};

export const getImgStyle = ({ direction }) => {
  const rotateImge = () => {
    if (direction === "bottom") {
      return "rotate(180deg)";
    }
    return "rotate(0deg)";
  };
  const getHeightWidth = () => {
    if (direction === "top" || direction === "bottom") {
      return {
        height: "50px",
      };
    }
    return { width: "35px" };
  };

  return {
    transform: rotateImge(),
    ...getHeightWidth(),
  };
};
