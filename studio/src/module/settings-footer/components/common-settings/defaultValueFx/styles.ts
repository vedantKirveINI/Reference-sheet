import { INPUT_HEIGHT } from "../../../constants/constants";

export const styles = {
  container: (style) => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: "0.85em",
      ...style,
    } as const;
  },
  label: {
    color: "#263238",
    fontFamily: "Inter",
    fontSize: "1em",
    fontStyle: "normal",
    fontWeight: 400,
    letterSpacing: "0.03125em",
    textWrap: "nowrap",
  },
  fxInputStyle: {
    width: "100%",
    minHeight: INPUT_HEIGHT,
    maxHeight: "200px",
    overflow: "auto",
    borderWidth: "0.075em",
    borderRadius: "0.375em",
  },
} as const;
