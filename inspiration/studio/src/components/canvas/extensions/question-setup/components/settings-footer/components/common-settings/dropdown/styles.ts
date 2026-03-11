import { ViewPort } from "@oute/oute-ds.core.constants";
import { INPUT_HEIGHT } from "../../../constants/constants";

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
  autocompleteTriggerContainer: ({
    isActive = false,
    viewPort,
    style = {},
  }: {
    isActive?: boolean;
    viewPort: string;
    style?: any;
  }) =>
    ({
      width: "100%",
      display: "flex",
      padding: "0.625em",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      alignSelf: "stretch",
      borderRadius: "0.375em",
      border: isActive
        ? "2.5px solid var(--blue, #2196F3);"
        : "0.75px solid var(--grey-lighten-4, #CFD8DC)",
      background: "var(--white, #FFF)",
      boxShadow: "0px 0px 0px 0px rgba(0, 0, 0, 0.00) inset",
      transition: "border .3s ease",
      ...style,
      height: INPUT_HEIGHT,
    }) as const,

  autocompleteTriggerText: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignSelf: "stretch",
    background: "",
    color: "#000",
    fontFamily: "Inter",
    fontSize: "1.1em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "110%",
    letterSpacing: "0.25px",
  },
  chipContainer: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexWrap: "wrap",
    maxHeight: "100px",
    gap: "10px",
  },

  autocomplete: {
    option: {
      cursor: "pointer !important",
      display: "flex !important",
      padding: "0.625em !important",
      alignItems: "center !important",
      gap: "0.75em !important",
      borderRadius: "0.5em !important",
      backdropFilter: "blur(10px) !important",
      background: "transparent !important",
      transition: "all .3s ease !important",
      text: (styles?: any) => {
        return {
          color: "#000",
          fontFamily: "Inter",
          fontSize: "0.9em",
          fontStyle: "normal",
          fontWeight: 400,
          letterSpacing: "0.01125em",
          ...styles,
        };
      },
    },
    listbox: (viewPort, style) => {
      return {
        boxSizing: "border-box",
        width: `${viewPort === ViewPort.MOBILE ? "100%" : "unset"} !important`,
        height: "14em !important",
        padding: "0.2em",
        ...style,
      } as const;
    },
    paper: (viewPort) => {
      return {
        overflowX: "hidden",
        border: "0.75px solid rgba(0, 0, 0, 0.20)",
        borderRadius: "0.75em",
        marginTop: "0.2em",
        marginBottom: "0.2em",
        boxShadow: "0px 4px 8px 0px rgba(122, 124, 141, 0.20)",
        paddingRight: viewPort === ViewPort.MOBILE ? "8px" : "",
      };
    },
    chip: {
      maxWidth: "14em",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "0.5em",
      padding: "0.25em 0.5em",
      borderRadius: "0.5em",
      background: "#263238",
      justifyContent: "center",
      alignSelf: "stretch",
      color: "#fff",
      fontFamily: "Inter",
      fontSize: "1.1em",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "110%",
      letterSpacing: "0.25px",
    },
  },
  selectedOptions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "0.5em",
  },
  tooltipContainer: {
    fontSize: "1em",
    width: "21.5em",
    maxHeight: "14em",
    overflow: "auto",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.5em",
  },

  closeIconContainer: {
    backgroundColor: "#fff",
    borderRadius: "1em",
    display: "flex",
    alignItems: "center",
  },
} as const;

export const SCROLLBAR_CLASS = "scrollbar-thin";
