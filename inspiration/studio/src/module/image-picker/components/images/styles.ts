export const getImageContainerStyles = {
  maxHeight: "100%",
  overflowY: "auto" as const,
} as const;

export const SCROLLBAR_CLASS = "scrollbar-medium";

export const getInfiniteScrollComponentStyles = () => {
  return {
    height: "100%",
    overflowY: "scroll" as const,
    overflowX: "hidden" as const,
    scrollBehavior: "smooth" as const,
  };
};

export const imageStyles = {
  container: {
    position: "relative",
    margin: "8px 0px 0px 0px",
    overflow: "hidden",
    borderRadius: "0.25em",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    transition: "all .3s ease-in-out",
  },
  effect: {
    position: "absolute",
    opacity: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#7F7F7F",
    transition: "opacity .3s ease",
  },
  username: {
    position: "absolute",
    opacity: 0,
    bottom: "10px",
    right: "10px",
    zIndex: 0,
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: "1em",
    fontStyle: "italic",
    fontWeight: 600,
    textTransform: "capitalize",
    textDecoration: "none",
    transition: "all .3s ease",
  },
} as const;

export const getRowStyles = () => {
  return {
    display: "flex",
    flexWrap: "wrap",
  } as const;
};

export const getColumnStyles = () => {
  return {
    flex: "50%",
    maxWidth: "50%",
    padding: "0 4px",
  };
};

export const gifImageStyles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "1em",
    alignItems: "center",
    alignContent: "center",
    boxSizing: "border-box",
    padding: "1rem 0.5rem",
    width: "100%",
  } as const,
  imageWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    alignContent: "center",
    boxSizing: "border-box",
    cursor: "pointer",
  } as const,
  image: (isSelected) => {
    return {
      width: "100%",
      height: "130px",
      display: "flex",
      padding: " 0.75px",
      gap: "10px",
      objectFit: "contain",
      borderRadius: "8px",
      border: `${isSelected ? "2px solid #FD5D2D" : "1px solid #CFD8DC"}`,
      boxShadow: "0px 1.5px 2.5px 0px rgba(26, 95, 158, 0.05)",
    } as const;
  },
  imageName: {
    margin: "2px auto",
  } as const,
};
