import { ViewPort } from "@oute/oute-ds.core.constants";

export const autoCompleteStyles = {
  getAutoCompleteContainerStyles: (option) => {
    const { isOpen, viewPort, isIntegration } = option;
    return {
      display: "flex",
      boxSizing: "border-box" as const,
      scrollBehavior: "smooth" as const,
      width: "100%",
      flexDirection: "column" as const,
      alignItems: "flex-start" as const,
      transition: "opacity .3s eas-in-out 0s" as const,
      height:
        !isIntegration && viewPort === ViewPort.MOBILE
          ? "100%"
          : ("unset" as const),
      position:
        !isIntegration && isOpen && viewPort === ViewPort.MOBILE
          ? "absolute"
          : "unset",
      top: 0,
      left: 0,
      right: 0,
      background:
        isOpen && viewPort === ViewPort.MOBILE
          ? "rgba(255, 255, 255, 0.70)"
          : "",
      zIndex: 100,
    } as const;
  },
  autocomplete: {
    root: ({ isOpen, theme, isIntegration }) => {
      return {
        width: "100%",
      };
    },
    option: {
      cursor: "pointer !important",
      display: "flex !important",
      padding: "0.625em !important",
      alignItems: "center !important",
      justifyContent: "flex-start !important",
      gap: "0.75em !important",
      borderRadius: "0.375em !important",
      transition: "all .3s ease !important",
      text: (viewPort) => {
        return {
          color: "#000",
          fontFamily: "Inter",
          fontSize: "0.9em",
          fontStyle: "normal",
          fontWeight: 400,
          letterSpacing: "0.01125em",
        };
      },
    },
    getListOptionStyles: () => {
        return {
            display: "-webkit-box" as const,
            "-webkit-line-clamp": '3',
            "-webkit-box-orient": "vertical" as const,
            overflow: "hidden" as const,
            textOverflow: "ellipsis" as const,
            borderRadius: "0.375em",
        };
    },
    chipContainer: ({ isOpen, viewPort }) => {
      return {
        width: "auto",
        maxWidth: "60%",
        display: "flex",
        alignItems: "flex-start",
        overflow: "auto",
        scrollbarWidth: "none",
        gap: 0,
      };
    },

    chip: (viewPort) => {
      return {
        padding: "1em 0.5em",
        borderRadius: "8px",
        border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
        background: "var(--grey-darken-4, #263238)",
        color: "#fff",
        fontFamily: "Inter",
        fontSize: "1em",
        fontStyle: "normal",
        fontWeight: 400,
        lineHeight: "18px",
      };
    },
    listbox: ({ viewPort, isIntegration }) => {
      return {
        boxSizing: "border-box",
        width: `${
          !isIntegration && viewPort === ViewPort.MOBILE ? "100%" : "unset"
        } !important`,
        maxHeight: `${
          !isIntegration && viewPort === ViewPort.MOBILE ? "42em" : "18em"
        } !important`,
        height: `${
          !isIntegration && viewPort === ViewPort.MOBILE ? "41em" : "unset"
        } !important`,
        backdropFilter: "blur(20px)",
        padding: "5px 8px",
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
      } as const;
    },
    paper: ({ viewPort, isIntegration }) => {
      return {
        maxWidth: `${
          !isIntegration && viewPort === ViewPort.MOBILE ? "498px" : "unset"
        } !important`,
        overflowX: "hidden",
        border: "0.75px solid rgba(0, 0, 0, 0.20)",
        marginBottom: "0.2em",
        boxShadow: "0px 4px 8px 0px rgba(122, 124, 141, 0.20)",
        background: "rgba(255, 255, 255, 0.70)",
        borderRadius: "0 0 0.375em 0.375em !important",
      };
    },
    otheOptionButton: (isSelected) => {
      return {
        color: isSelected ? "#fff" : "#000",
        background: isSelected ? "rgba(33, 33, 33) !important" : "",
      };
    },
  },
} as any;

export const SCROLLBAR_CLASS = "scrollbar-thin";
