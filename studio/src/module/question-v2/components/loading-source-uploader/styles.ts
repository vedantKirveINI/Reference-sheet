export const style = {
  container: (isCreator) => {
    return {
      width: "8em",
      height: "8em",
      marginBottom: "8px",
      position: "relative",
      borderRadius: "12px",
      cursor: "pointer",
      "&:hover": isCreator && {
        background: "rgba(0, 0, 0, 0.37)",
        svg: {
          display: "block",
        },
      },
      boxSizing: "border-box",
    } as const;
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  } as const,
  icon: {
    display: "none",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  } as const,
};
