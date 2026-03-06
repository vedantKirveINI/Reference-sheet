import { INPUT_HEIGHT } from "../../../constants/constants";

export const styles = {
  container: (style: any = {}) => {
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
      ...style,
    };
  },
  getInputWrapperContainerStyle: (style: any = {}) => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: "0.85em",
      position: "relative" as const,
      ...style,
    };
  },
};
