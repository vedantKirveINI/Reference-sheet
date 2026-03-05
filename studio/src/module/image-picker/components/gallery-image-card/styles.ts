export const galleryImageCardStyles = {
  container: (src: string) => {
    return {
      position: "relative",
      display: "flex",
      width: "100%",
      height: "12.5em",
      borderRadius: "0.375em",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--hover-light, rgba(0, 17, 106, 0.10))",
      transition: "all .3s ease-in-out",
    } as const;
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    inset: 0,
    display: "flex",
    opacity: 0,
    transition: "opacity .3s ease-in-out",
    background:
      "linear-gradient(0deg, rgba(0, 0, 0, 0.64) 0%, rgba(0, 0, 0, 0.64) 100%)",
  } as const,
  buttons: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    gap: "0.75rem",
    zIndex: 2,
  } as const,
  imageText: {
    color: "#fff",
    marginTop: "auto",
    zIndex: 2,
    padding: "0.75rem",
  } as const,
} as const;
