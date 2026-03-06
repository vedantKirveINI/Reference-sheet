import { ViewPort } from "@src/module/constants";

export const SCROLLBAR_CLASS = "custom-scrollbar";

const getStylesForLayout = ({
  viewPort,
  isAugmentorAvailable,
  augmentorAlignment,
  questionAlignment,
}: any) => {
  let alignment;
  if (viewPort === ViewPort.DESKTOP) {
    const _alignment = augmentorAlignment?.cardDesktop;
    if (_alignment === "background") {
      return {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      } as const;
    }
    if (_alignment === "left") {
      alignment = "row-reverse" as const;
    }
    if (_alignment === "right") {
      alignment = "row" as const;
    }
  }

  if (viewPort === ViewPort.MOBILE) {
    const _alignment = augmentorAlignment?.cardMobile;
    if (_alignment === "background" && isAugmentorAvailable) {
      return {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      } as const;
    }
    if (_alignment === "top") {
      alignment = "flex-start" as const;
    }
  }

  // for desktop always in center in card or classic mode
  if (viewPort === ViewPort.DESKTOP) {
    return {
      flexDirection: alignment,
      alignItems: "center",
      justifyContent: questionAlignment,
    } as const;
  }
  // augmentor available mobile
  if (viewPort === ViewPort.MOBILE && isAugmentorAvailable) {
    return {
      alignItems: alignment,
      flexDirection: "column-reverse",
      justifyContent: "flex-end",
    } as const;
  }
  // when no augmentor available then question should be at top in creator and center in filler mode
  if (viewPort === ViewPort.MOBILE) {
    return {
      flexDirection: alignment,
      alignItems: "center",
      justifyContent: questionAlignment,
    } as const;
  }

  return {};
};

export const getContainerStyles = (options: any) => {
  const {
    augmentorAlignment,
    viewPort,
    isAugmentorAvailable,
    isCreator,
    questionAlignment,
  } = options;
  const stylesOnLayout = getStylesForLayout({
    viewPort,
    isAugmentorAvailable,
    augmentorAlignment,
    questionAlignment,
  });
  //need to check with height this is used for scrolling issue only
  const getHeight = () => {
    if (viewPort === ViewPort.MOBILE && isAugmentorAvailable && isCreator) {
      return "unset";
    }
    if (viewPort === ViewPort.MOBILE && isAugmentorAvailable && !isCreator) {
      return "100%";
    }

    return "100%";
  };

  return {
    display: "flex",
    height: getHeight(),
    ...stylesOnLayout,
  } as const;
};

export const getQuestionSectionContainerStyles = ({
  viewPort,
  isAugmentorAvailable,
  questionAlignment,
  isCreator,
  augmentorAlignment,
  showHelp,
}: any) => {
  const getPadding = () => {
    //larger padding in filler mode
    if (!isCreator && viewPort === ViewPort.DESKTOP) {
      return "1.5em 3em";
    }
    // Reduce left padding in creator mode for desktop (similar to chat view)
    if (isCreator && viewPort === ViewPort.DESKTOP) {
      return "3em 1.5em 3em 0.75em";
    }
    return "3em 1.5em";
  };

  const getMaxHeight = () => {
    if (viewPort === ViewPort.MOBILE && isAugmentorAvailable) {
      return "unset";
    }
    return "100%";
  };

  const getScroll = () => {
    if (viewPort === ViewPort.MOBILE && isAugmentorAvailable && !isCreator) {
      return {
        overflowX: "unset" as const,
        overflowY: "unset" as const,
      };
    } else {
      return {
        overflowX: "hidden" as const,
        overflowY: "scroll" as const,
        scrollBehavior: "smooth" as const,
      };
    }
  };

  return {
    padding: getPadding(),
    display: "flex",
    flexDirection: "column",
    gap: showHelp ? "1.25em" : "0",
    alignItems: questionAlignment,
    maxHeight: getMaxHeight(),
    width:
      isAugmentorAvailable &&
      viewPort === ViewPort.DESKTOP &&
      augmentorAlignment?.cardDesktop !== "background"
        ? "50%"
        : "100%",
    // ...getWidth(),
    position: isCreator && "relative", //relative style is given for the rewrite ai styles for creator mode only
    ...getScroll(),
  } as const;
};

export const getCTAContainer = ({ showHelp }) => {
  return {
    marginTop: showHelp ? "0" : "1.25em",
    marginLeft: 1,
    width: "100%",
  } as const;
};

export const getErroStyle = () => {
  return {
    width: "fit-content",
    marginTop: "1.25em",
    marginLeft: 1,
  };
};

export const getAnsContainer = ({
  isAugmentorAvailable,
  viewPort,
  augmentorAlignment,
  showHelp,
}) => {
  let augAlignment = "";

  if (viewPort === ViewPort.DESKTOP) {
    augAlignment = augmentorAlignment?.cardDesktop;
  } else {
    augAlignment = augmentorAlignment?.cardMobile;
  }

  const getWidth = () => {
    if (isAugmentorAvailable && augAlignment === "background") {
      return "70%";
    }
    if (isAugmentorAvailable || viewPort === ViewPort.MOBILE) {
      return "100%";
    }
    return "70%";
  };
  return {
    width: getWidth(),
    marginTop: showHelp ? "0" : "1.25em",
  };
};

export const getAugmentorStyle = ({ viewPort }: any) => {
  return {
    height: viewPort === ViewPort.DESKTOP ? "100%" : "21em",
    borderRadius: viewPort === ViewPort.MOBILE ? 0 : "0.75em",
  };
};
