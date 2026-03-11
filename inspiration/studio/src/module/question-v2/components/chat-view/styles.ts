import { ViewPort } from "@src/module/constants";

export const SCROLLBAR_CLASS = "custom-scrollbar";

export const getContainerStyles = ({
  viewPort,
  isCreator,
  isPreviewMode,
}) => {
  const getPadding = () => {
    if (isCreator) {
      return { paddingBottom: "3.375em" };
    } else {
      return { paddingBottom: "2em" };
    }
  };
  const shouldConstrainScroll = isCreator || isPreviewMode;
  return {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    // Same as Classic/Card: scroll on this container so scrollbar is at container edge (no extra wrapper)
    ...(shouldConstrainScroll
      ? {
          maxHeight: "100%" as const,
          minHeight: 0,
          overflowX: "hidden" as const,
          overflowY: "auto" as const,
          scrollBehavior: "smooth" as const,
        }
      : {}),
    paddingTop: "0.625em",
    paddingLeft: isCreator
      ? "1.5em"
      : viewPort === ViewPort.DESKTOP
        ? "2px"
        : "1.5em",
    paddingRight: isCreator
      ? "1.5em"
      : viewPort === ViewPort.DESKTOP
        ? "2px"
        : "1.5em",
    ...getPadding(),
  } as const;
};

export const getQuestionContainer = ({ viewPort, isCreator }) => {
  return {
    marginTop: "auto",
    width:
      viewPort === ViewPort.MOBILE
        ? "90%"
        : !isCreator && viewPort === ViewPort.DESKTOP
          ? "90%"
          : "60%",
    background: isCreator ? "rgba(255,255,255, 0.8)" : "rgba(255,255,255, 0.2)",
    ...(isCreator ? {} : { backdropFilter: "blur(32px)" }),
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    border: "0.75px solid rgba(0, 0, 0, 0.20)",
    borderRadius: "1.25em 1.25em 1.25em 0",
  } as const;
};
export const getCTAContainer = () => {
  return {
    marginTop: 20,
    paddingBottom: 5,
  };
};

export const getAnsContainer = ({ viewPort, isCreator, isAnswering }) => {
  const getWidth = () => {
    if (isCreator) {
      return viewPort === ViewPort.DESKTOP ? "60%" : "90%";
    }
    if (!isCreator && !isAnswering) {
      return "100%";
    }
    if (!isCreator && isAnswering) {
      return "90%";
    }
  };
  return {
    width: getWidth(),
    margin: "20px 2px 0 0px",
  } as const;
};
