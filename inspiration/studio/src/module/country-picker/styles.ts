import { ViewPort } from "@oute/oute-ds.core.constants";

export const styles = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: "2em",
    marginTop: "2em",
  },
  alignmentContainer: (viewPort) => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "2em",
    } as any;
  },
  switchContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2em",
  },
  countriesContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.75em",
    text: {
      color: "#000",
      fontFamily: "Inter",
      fontSize: "0.875em",
      fontStyle: "normal",
      fontWeight: 600,
      letterSpacing: "0.078125em",
      textTransform: "uppercase",
    },
  },
  wrapperContainer:{
    display: "flex",
    alignItems: "center",
    gap:8
  },
  autocompleteTriggerContainer: (isActive?:any) =>
    {
      return{
      width: "261px",
      padding: 10,
      marginLeft: "2px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      alignSelf: "stretch",
      borderRadius: 12,
      border: isActive
        ? "2.5px solid var(--blue, #2196F3);"
        : "0.75px solid var(--grey-lighten-4, #CFD8DC)",
      background: "var(--white, #FFF)",
      boxShadow: "0px 0px 0px 0px rgba(0, 0, 0, 0.00) inset",
      transition: "border .3s ease",
    }as const
  },

  autocompleteTriggerText: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flex: "1 0 0",
    alignSelf: "stretch",
    color: "#000",
    fontFamily: "Inter",
    fontSize: "1.1em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "110%",
    letterSpacing: "0.25px",
  },

  option:(styles?: any)=>{
    return{
    cursor: "pointer !important",
    display: "flex !important",
    padding: "0.625em !important",
    alignItems: "center !important",
    gap: "0.75em !important",
    borderRadius: "0.5em !important",
    backdropFilter: "blur(10px) !important",
    background: "transparent !important",
    transition: "all .3s ease !important",
    ...styles,
  }
},
  text: (styles?: any) => {
    return {
      color: "#000",
      fontFamily: "Inter",
      fontSize: "0.9em",
      fontStyle: "normal",
      fontWeight: 400,
      letterSpacing: "0.01125em",
      ...styles,
    }as const;
  },
  listbox: (style) => {
    return {
      boxSizing: "border-box",
      width: `100%!important`,
      height: "13.6875em",
      marginRight: "0.5em",
      marginTop: "0.5em",
      ...style,
    } as const;
  },
  paper: (style) => {
    return {
      overflowX: "hidden",
      border: "0.75px solid rgba(0, 0, 0, 0.20)",
      borderRadius: "0.75em",
      marginTop: "0.2em",
      marginBottom: "0.2em",
      boxShadow: "0px 4px 8px 0px rgba(122, 124, 141, 0.20)",
      paddingRight: "8px",
      ...style,
    };
  },
} as const;

export const SCROLLBAR_CLASS = "scrollbar-thin";
