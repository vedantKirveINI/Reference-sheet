import { Mode, ViewPort } from "@src/module/constants";

export const getMainContainerStyles = ({ bgStyles, fontSize }) => {
  return {
    width: "100%",
    height: "100%",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    ...bgStyles,
    fontSize,
    justifyContent: "flex-end",
  } as const;
};

export const getQuestionContainerStyles = () => {
  return {
    height: "100%",
    width: "100%",
    fontFamily: "Noto Serif",
    // overflowY:"scroll",
    ...getScrollBarStyles(),
  } as const;
};

export const getQuestionsWrapperStyles = (option: any) => {
  const { mode, viewPort } = option;
  // For classic mode, spacing is handled by card marginBottom, so gap is 0
  const getGap = () => {
    if (mode === Mode.CHAT) return "2em";
    if (mode === Mode.CLASSIC) return "0"; // Spacing handled by card marginBottom
    return "1em";
  };
  
  // Get padding for classic mode with top spacing
  const getPadding = () => {
    if (viewPort === ViewPort.MOBILE) {
      return mode === Mode.CLASSIC ? "0.5rem 1.5rem" : "0";
    }
    if (mode === Mode.CHAT) return "0 26%";
    if (mode === Mode.CLASSIC) return "0.5rem 10em"; // Add top padding for whitespace
    return "0 10em";
  };
  
  return {
    display: "flex",
    height: mode !== Mode.CHAT && "100%",
    gap: getGap(),
    flexDirection: "column",
    padding: getPadding(),
    overflowY: mode !== Mode.CARD ? "auto" : "",
    overflowX: "hidden",
    scrollBehavior: "smooth",
    margin:
      mode !== Mode.CARD && viewPort === ViewPort.DESKTOP
        ? "0px 0px 0px 0"
        : "", //to place scrollbar on right side with some gap
    ...getScrollBarStyles(),
  } as any;
};

const getScrollBarStyles = () => {
  return {
    scrollBehavior: "smooth" as const,
  };
};

export const SCROLLBAR_CLASS = "scrollbar-thin";
