import { ViewPort } from "@oute/oute-ds.core.constants";

export const styles = {
  container: {
    margin: "1em 0",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3.31em",
  } as const,
  wrapperContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "3em",
  } as const,
  getInputStyle: () => {
    return {
      width: "100%",
      borderRadius: "0.375em",
      background: "transparent",
    };
  },

  getInputWrapperContainerStyle: () => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      position: "relative",
    } as const;
  },

  textarea: () => {
    return {
      width: "100%",
      resize: "none",
      height: "8em",
      borderRadius: "0.75em",
      padding: "0.5em",
      border: "0.75px solid rgba(0, 0, 0, 0.20)",
      background: "transparent",
      outline: "none",
      fontFamily: "Inter",
      fontSize: "1em",
      fontStyle: "normal",
      fontWeight: 400,
      letterSpacing: "0.03125em",
    } as const;
  },
};
