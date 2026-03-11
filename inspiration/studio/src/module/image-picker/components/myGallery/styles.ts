export const SCROLLBAR_CLASS = "scrollbar-medium";

export const imageStyles = {
  grid: {
    height: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.25rem",
  },

  loaderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  loaderText: {
    color: "#666",
    fontSize: "0.875rem",
    fontWeight: "400",
    margin: 0,
  },
  imageContainer: {
    position: "relative",
    width: "23.65rem",
    height: "12.5rem",
    borderRadius: "0.375rem",
    overflow: "hidden",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "all .3s ease-in-out",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    opacity: 0,
    transition: "opacity .3s ease-in-out",
    background:
      "linear-gradient(0deg, rgba(0, 0, 0, 0.64) 0%, rgba(0, 0, 0, 0.64) 100%)",
  },
  buttons: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    gap: "0.75rem",
    zIndex: 2,
  },
  imageText: {
    color: "#fff",
    marginTop: "auto",
    zIndex: 2,
    padding: "0.75rem",
  },
} as const;

export const getSettingDialogContainerStyles = {
  marginTop: "2rem",
  display: "flex",
  flexDirection: "column" as const,
  padding: "0em 1.25em",
  gap: "2rem",
};

export const getAltTextContainerStyles = () => {
  return {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  };
};

export const getAlignmentContainerStyles = () => {
  return {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  };
};

export const getAlignmentWrapContainerStyles = () => {
  return {
    display: "flex",
    gap: "2.75rem",
    alignItems: "center",
  };
};

export const getAlignmentIconContainerStyles = () => {
  return {
    display: "flex",
    gap: "1.5rem",
  };
};

export const getAlignmentIconStyle = ({ iconColor }) => {
  return {
    height: "3.02rem",
    width: "4.8rem",
    color: iconColor,
    borderRadius: "0.375rem",
    padding: "0.17rem",
    border: `1.6px solid ${iconColor}`,
  };
};

export const getBackgroundOuterDivStyles = ({ isActive, isDisabled }) => {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "3.02rem",
    width: "4.8rem",
    border: `1.6px solid ${isActive ? "#212121" : "#C7C7C7"}`,
    borderRadius: "0.375rem",
    padding: "0.17rem 0.2rem",
    cursor: isDisabled ? "not-allowed" : "pointer",
  };
};

export const getBackgroundInnerDivStyles = ({ isActive }) => {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "2.6rem",
    width: "4.3rem",
    borderRadius: "0.375rem",
    background: isActive ? "#212121" : "#fff",
  };
};

export const getEditImageContainerStyles = () => {
  return {
    position: "absolute" as const,
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    borderRadius: "0.625rem",
    background: "white",

    display: "grid",
    gridTemplateRows: "1fr auto",
    height: "100%",
  };
};
export const getFooterStyles = () => {
  return {
    display: "flex",
    justifyContent: "flex-end",
    padding: "1rem 1.25rem",
    borderTop: "1px solid #fd5d2d",
  } as const;
};
