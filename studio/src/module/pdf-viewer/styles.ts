export const styles = {
  getInputStyles: () => {
    return {
      width: "100%",
      border: "0.75px solid #CFD8DC",
      padding: "0.7em",
      fontSize: "1em",
    };
  },

  getErrorContainerStyles: (): React.CSSProperties => {
    return {
      width: "100%",
      background: "#fff",
      display: "flex",
      borderRadius: "0.75em",
      flexDirection: "column",
      padding: "1em 0em",
      gap: "1em",
    };
  },

  getImageStyles: (): React.CSSProperties => {
    return {
      width: "100%",
      height: "4.9375em",
      objectFit: "cover",
    };
  },

  getErrorStyles: (): React.CSSProperties => {
    return {
      display: "flex",
      flexDirection: "column",
      gap: "1em",
      padding: "1em",
    };
  },

  getErrorTextStyle: () => {
    return {
      fontFamily: "Helvetica Neue, Inter",
      fontSize: "1.25em",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "1.375em",
      letterSpacing: "0.01563em",
    };
  },
  getPageStyles: () => {
    return {
      width: "20%",
      height: "50%",
    };
  },
};
