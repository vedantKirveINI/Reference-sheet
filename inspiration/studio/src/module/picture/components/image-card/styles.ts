export const getOptionImageStyles = () => {
  return {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    objectFit: "cover",
    cursor: "pointer",
    borderRadius: "0.5em",
    background: "var(--hover-light, rgba(0, 17, 106, 0.10))",
    aspectRatio: "1/1",
  } as const;
};
