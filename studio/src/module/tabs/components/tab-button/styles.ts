function getBorderStyle(border) {
  const width = border?.width || "1px";
  const color = border?.color || "#000000";
  const style = border?.style || "solid";
  return {
    borderWidth: width,
    borderColor: color,
    borderStyle: style,
  };
}

function getBoxShadow(elevation) {
  const { x, y, blur, spread, color } = elevation;

  return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

const getTabButtonTextStyles = {
  color: "#263238",
  textAlign: "center",
  fontFamily: "Inter",
  fontSize: "0.875em",
  fontStyle: "normal",
  fontWeight: 600,
  letterSpacing: "0.078125em",
  textTransform: "uppercase",
} as const;
export const getIconTabButtonContainer = (options: any) => {
  const { isSelected } = options;

  const borderStyles = isSelected
    ? getBorderStyle({
        color: "rgba(0, 0, 0, 0.2)",
        width: "0.046875em",
      })
    : {
        ...getBorderStyle({ color: "rgba(0, 0, 0, 0.2)", width: "0.046875em" }),
        borderColor: "transparent",
      };

  const boxShadow = isSelected
    ? getBoxShadow({
        x: "0",
        y: "4",
        blur: "8",
        spread: "0",
        color: "rgba(122,124,141,0.2)",
        type: "dropShadow",
      })
    : "none";
  return {
    cursor: "pointer",
    backgroundColor: isSelected ? "white" : "transparent",
    spacing: "0.25em",
    // height: "2.5em",
    // width: "2.5em",
    padding: "0.7em",
    borderRadius: "0.625em",
    boxShadow,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    ...borderStyles,
    ...getTabButtonTextStyles,
  };
};

export const getTabButtonContainer = (options: any) => {
  const { isSelected } = options;

  const borderStyles = isSelected
    ? getBorderStyle({
        color: "rgba(0, 0, 0, 0.2)",
        width: "0.046875em",
      })
    : {
        ...getBorderStyle({
          color: "rgba(0, 0, 0, 0.2)",
          width: "0.046875em",
        }),
        borderColor: "transparent",
      };

  const boxShadow = isSelected
    ? getBoxShadow({
        x: "0",
        y: "4",
        blur: "8",
        spread: "0",
        color: "rgba(122,124,141,0.2)",
        type: "dropShadow",
      })
    : "none";
  return {
    color: "#263238",
    cursor: "pointer",
    backgroundColor: isSelected ? "white" : "transparent",
    width: "6.25em",
    height: "3.1em",
    borderRadius: "0.75em",
    boxShadow,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    ...borderStyles,
    fontWeight: 600,
    letterSpacing: 1.25,
    textTransform: "uppercase",
    ...getTabButtonTextStyles,
  };
};
