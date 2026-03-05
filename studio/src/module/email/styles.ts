import { ViewPort } from "@oute/oute-ds.core.constants";

export const emailStyles = {
  getDomainListStyles: {
    width: "fit-content",
    border: "1px solid rgba(0, 17, 106, 0.20)",
    borderRadius: "0.75em",
    listStyle: "none",
    padding: "10px",
    margin: 0,
    position: "absolute",
    left: "1.25em",
    top: "3em",
    zIndex: 9999,
    backgroundColor: "white",
    cursor: "pointer",
  } as const,

  otpSentStyle: ({ theme }) => {
    return {
      fontSize: "1em",
      marginTop: 5,
      color: theme?.styles?.buttons,
      fontFamily: theme?.styles?.fontFamily,
    } as const;
  },

  getOtpContainerStyles: ({ viewPort }) => {
    return {
      display: "flex",
      flexDirection: viewPort === ViewPort.MOBILE ? "column" : "row",
      justifyContent: "space-between",
      alignItems: viewPort === ViewPort.MOBILE && "flex-start",
    } as const;
  },

  getOtpInputStyles: ({ error, theme }) => {
    return {
      width: "3.75rem",
      height: "3.75rem",
      textAlign: "center",
      border: "0.75px solid rgba(0, 0, 0, 0.20)",
      borderRadius: "0.375rem",
      outline: "none",
      background: `${theme?.styles?.buttons}1A`,
      backdropFilter: "blur(10px)",
      boxShadow: !!error && "0px 0px 0px 2px #C83C3C",
      color: theme?.styles?.buttons,
    } as const;
  },
};
