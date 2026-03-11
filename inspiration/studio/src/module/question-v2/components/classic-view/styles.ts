import { Mode, QuestionType, ViewPort } from "@oute/oute-ds.core.constants";

export const SCROLLBAR_CLASS = "custom-scrollbar";

const getStylesForLayout = ({
  viewPort,
  isAugmentorAvailable,
  augmentorAlignment,
}: any) => {
  let alignment;
  if (viewPort === ViewPort.DESKTOP) {
    let _alignment = augmentorAlignment?.classicDesktop;
    if (_alignment === "left") {
      alignment = "row-reverse" as const;
    }
    if (_alignment === "right") {
      alignment = "row" as const;
    }
    if (_alignment === "background") {
      alignment = "center" as const;
    }
  }

  if (viewPort === ViewPort.MOBILE) {
    alignment = "flex-start" as const;
  }

  // For desktop: center content vertically (same as Card view)
  if (viewPort === ViewPort.DESKTOP) {
    return {
      flexDirection: alignment,
      // In classic mode we want the question card to start from the top,
      // not be vertically centered in the available height.
      alignItems: "flex-start",
    } as const;
  }
  // augmentor available mobile
  if (viewPort === ViewPort.MOBILE && isAugmentorAvailable) {
    return {
      alignItems: alignment,
      flexDirection: isAugmentorAvailable ? "column-reverse" : "unset",
    } as const;
  }
  // when no augmentor available, center content vertically (same as Card view)
  if (viewPort === ViewPort.MOBILE) {
    return {
      flexDirection: alignment,
      // In classic creator we want content to start from the top on mobile too.
      alignItems: "flex-start",
    } as const;
  }

  return {};
};

export const getContainerStyles = (options: any) => {
  const { augmentorAlignment, viewPort, isAugmentorAvailable } = options;
  const stylesOnLayout = getStylesForLayout({
    viewPort,
    isAugmentorAvailable,
    augmentorAlignment,
  });
  //need to check with height this is used for scrolling issue only

  return {
    display: "flex",
    height: "100%",
    ...stylesOnLayout,
  } as const;
};

export const getQuestionSectionContainerStyles = ({
  viewPort,
  isAugmentorAvailable,
  type,
  mode,
  isCreator = false,
  questionAlignment,
}: any) => {
  const getMaxHeight = () => {
    if (viewPort === ViewPort.MOBILE && isAugmentorAvailable) {
      return "unset";
    }
    return "100%";
  };

  const getScroll = () => {
    // In Classic mode creator, allow vertical overflow to be visible to prevent text clipping
    // The parent container (WizardDrawer ScrollArea) handles scrolling
    // Only apply to creator mode to avoid affecting filler mode
    if (mode === Mode.CLASSIC && isCreator) {
      return {
        overflowX: "hidden" as const,
        overflowY: "visible" as const,
      };
    }
    return {
      overflowX: "hidden" as const,
      overflowY: "hidden" as const,
      scrollBehavior: "smooth" as const,
    };
  };

  // Card-like layout for classic mode only
  const getClassicCardStyles = () => {
    if (mode === Mode.CLASSIC) {
      return {
        borderRadius: "1rem",
        border: "none", // No border in classic mode
        // Remove box shadow in both creator and preview for clean appearance
        boxShadow: "none",
        // Reduce left padding in creator mode for desktop (similar to chat view)
        padding: isCreator && viewPort === ViewPort.DESKTOP
          ? "2rem 1.5rem 1.5rem 0.75rem"
          : "2rem 1.5rem 1.5rem 1.5rem", // Extra top padding to prevent text clipping
        marginBottom: "1.5rem",
        backgroundColor: "transparent", // Theme can override background color
      };
    }
    return {
      padding: "1.5em",
    };
  };

  // Apply question alignment if provided (for CARD and CLASSIC modes)
  const getAlignmentStyles = () => {
    if (type === QuestionType.LOADING) {
      return { alignItems: "center" };
    }
    if (questionAlignment && (mode === Mode.CARD || mode === Mode.CLASSIC)) {
      return { alignItems: questionAlignment };
    }
    return {};
  };

  return {
    ...getClassicCardStyles(),
    display: "flex",
    flexDirection: "column",
    maxHeight: getMaxHeight(),
    width:
      isAugmentorAvailable && viewPort === ViewPort.DESKTOP ? "50%" : "100%",
    ...getAlignmentStyles(),
    // ...getWidth(),
    ...getScroll(),
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
  mode,
}) => {
  let augAlignment = "";

  if (viewPort === ViewPort.DESKTOP) {
    augAlignment = augmentorAlignment?.classicDesktop;
  } else {
    augAlignment = "top";
  }

  const getWidth = () => {
    // In classic mode, always use full width for inputs
    if (mode === Mode.CLASSIC) {
      return "100%";
    }
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
    marginTop: "1.25em",
  };
};

export const getAugmentorStyle = ({ viewPort }: any) => {
  return {
    height: viewPort === ViewPort.DESKTOP ? "23.75em" : "21em",
    borderRadius: viewPort === ViewPort.MOBILE ? 0 : "0.75em",
  };
};
