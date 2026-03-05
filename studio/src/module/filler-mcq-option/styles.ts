const getOptionContainerStyle = ({ isChecked, style, isImage }: any) => {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: "1em",
    cursor: "pointer",
    width: "17em",
    minHeight: isImage ? "17em" : "3em",
    padding: "0.8em",
    borderRadius: "0.75em",
    border: isChecked ? `2px solid #4694e2` : `1px solid rgba(0, 0, 0, 0.2)`,
    background: "rgba(255, 255, 255, 0.80)",
    backgroundFilter: "blur(10px)",
    boxSizing: "border-box",
    backgroundPosition: "center",
    backgroundSize: "0%",
    transition: "background .8s ease",
    ...style,
  } as const;
};

const getImageStyles = () => {
  return {
    height: "15em",
    borderRadius: "0.5em",
  };
};

export { getOptionContainerStyle, getImageStyles };
