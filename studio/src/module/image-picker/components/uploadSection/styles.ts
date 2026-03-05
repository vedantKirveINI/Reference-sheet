export const mainContainerStyles = () => {
  return {
    width: "100%",
    height: "100%",
    flex: 1,
    display: "flex",
    gap: "2rem",
    flexDirection: "column" as const,
  };
};

export const uploadContainerStyles = ({ isDragActive }) => {
  return {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    background: isDragActive ? "#FFE3D6" : "#e1e4e8",
    borderRadius: "0.5rem",
    gap: "1.5rem",
    padding: "0.75rem",
  };
};

export const imagePreviewStyles = () => {
  return { height: 100, width: 100 };
};

export const orTextStyles = () => {
  return {
    fontSize: "0.875rem",
    color: "grey",
  };
};

export const imageValidationTextStyles = () => {
  return { fontSize: 14 };
};

export const imageContainerStyles = () => {
  return {
    display: "flex",
    flex: 1,
    background: "#e1e4e8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    borderRadius: 12,
    flexDirection: "column",
    padding: 20,
  };
};

export const errorStyles = () => {
  return {
    color: "#FF5252",
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: "1em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "110%" /* 17.6px */,
    letterSpacing: "0.25px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    margin: 0,
  } as const;
};
