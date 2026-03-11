import { INPUT_HEIGHT } from "../../../constants/constants";

export const styles = {
  container: (style) => {
    return {
      height: INPUT_HEIGHT,
      width: "100%",
      display: "flex",
      alignItems: "center",
      padding: "0.625em",
      border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
      borderRadius: ".375rem",
      letterSpacing: "0.032rem",
      font: '400 1rem / 1.5rem "Inter", sans-serif',
      "&:focus-within": {
        outline: " 2px solid #212121",
        borderColor: "transparent",
      },
      "&:hover:not(:focus-within)": {
        borderColor: "#212121",
      },
      ...style,
    };
  },
  getInputWrapperContainerStyle: (style) => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: "0.85em",
      position: "relative",
      ...style,
    } as const;
  },
};
