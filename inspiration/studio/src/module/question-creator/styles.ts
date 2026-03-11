import { Mode, ViewPort } from "@src/module/constants";

// Only For creator shrink change in desktop
const getPadding = (viewPort, mode, isAugmentorAvailable) => {
  if (
    viewPort === ViewPort.DESKTOP &&
    mode === Mode.CARD &&
    !isAugmentorAvailable
  ) {
    return "0rem 1.5rem 0rem 0.75rem";
  }

  if (viewPort === ViewPort.DESKTOP && mode === Mode.CLASSIC) {
    return "2rem 1.5rem 0rem 0.75rem";
  }

  if (viewPort === ViewPort.MOBILE && mode === Mode.CHAT) {
    return "0rem 1.5rem";
  }
};

//Mobile and Desktop UI Shrink style
const getCreatorUIStyles = (viewPort, mode, isAugmentorAvailable) => {
  if (viewPort === ViewPort.MOBILE) {
    return {
      height: "100%",
      boxShadow:
        "0px 4px 16px 0px rgba(0, 0, 0, 0.08), 0px 2px 8px 0px rgba(0, 0, 0, 0.04)",
      borderRadius: "1.25rem",
    };
  }

  const padding = getPadding(viewPort, mode, isAugmentorAvailable);

  const styles = {
    width: "100%",
    fontSize: "8px",
    height: "100%",
    boxShadow:
      "0px 4px 16px 0px rgba(0, 0, 0, 0.08), 0px 2px 8px 0px rgba(0, 0, 0, 0.04)",
    borderRadius: "1.25rem",
    padding,
  };

  return styles;
};

export const getContainerStyles = (options: any) => {
  const {
    bgStyles = {},
    styles = {},
    viewPort,
    mode,
    isAugmentorAvailable,
  } = options;
  return {
    position: "relative",
    flexDirection: "column" as const,
    ...getCreatorUIStyles(viewPort, mode, isAugmentorAvailable),
    // bg styles mainly has image/bgcolor based on theme
    overflow:
      mode === Mode.CARD && viewPort === ViewPort.DESKTOP ? "hidden" : "auto",
    ...bgStyles,
    ...styles,
    boxSizing: "border-box" as const,
  };
};

export const SCROLLBAR_CLASS = "scrollbar-thin";
