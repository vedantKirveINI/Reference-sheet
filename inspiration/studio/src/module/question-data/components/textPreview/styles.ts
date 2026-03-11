export const getMainContainerStyles = () => {
  return {
    padding: "0.625em 1em",
    display: "flex",
    flexDirection: "column",
    // alignItems: "center",
    // boxSizing: "border-box",
    gap: "1.5em",
    width: "100%",
  } as const;
};

export const editorStyles = () => {
  return {
    padding: "0.375em",
    width: "100%", //37em
    maxWidth: "100%",
    height: "11.25em", // 11.25em
    borderRadius: "0.375em",
    border: "1px solid rgba(0, 0, 0, 0.20)",
    opacity: "0.95",
    background: "rgba(255, 255, 255, 0.70)",
    backdropFilter: "blur(10px)",
    overflowY: "auto",
    fontSize: "1.15em",
    "& #editor": {
      width: "100%",
      height: "100%",
    },
    "& .content-editor": {
      width: "100%",
      height: "100%",
    },
    "& .placeholder": {
      padding: "0.375em",
      color: "rgba(0,0,0,0.5)",
    },
    "&:focus-within": {
      outline: " 2px solid #212121",
      borderColor: "transparent",
    },
    "&:hover:not(:focus-within)": {
      borderColor: "#212121",
    },
  };
};
