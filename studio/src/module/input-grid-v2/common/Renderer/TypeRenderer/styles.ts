export const adornmentStyles = {
  display: "grid",
  alignItems: "center",
  gridTemplateColumns: "auto auto",
  gap: "0.5rem",
};

export const getContainerStyles = ({ disableTypeEditing = false }) => {
  return {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    height: "inherit",
    padding: "0.375rem",
    boxSizing: "border-box" as const,

    ...(!disableTypeEditing && {
      "&:hover": {
        background: "#F5F5F5",
        cursor: "pointer",
      },
    }),
  };
};

export const iconContainerStyles = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  width: "1.25rem",
};

export const labelStyles = {
  fontSize: "1rem",
  color: "#263238",
  flex: "1",
};
