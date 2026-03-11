import {
  Mode,
  QuestionAlignments,
  ViewPort,
} from "@oute/oute-ds.core.constants";

const getFlexDirectionStyle = (
  vertical,
  mode,
  viewPort,
  isAugmentorAvailable
) => {
  if (vertical) {
    return "column";
  } else {
    if (mode === Mode.CHAT) return "row";

    if (viewPort === ViewPort.DESKTOP && isAugmentorAvailable) return "column";

    if (viewPort === ViewPort.MOBILE || isAugmentorAvailable) return "row";
  }

  return "row";
};

export const getContainerStyles = ({
  vertical,
  settings,
  mode,
  isAugmentorAvailable,
  viewPort,
}: any) => {
  const alignmentCenter =
    settings?.questionAlignment === QuestionAlignments.CENTER;
  return {
    marginLeft: "1px",
    width: "100%",
    display: "flex",
    flexDirection: getFlexDirectionStyle(
      vertical,
      mode,
      viewPort,
      isAugmentorAvailable
    ),
    alignItems: mode === Mode.CARD && alignmentCenter && "center",
    justifyContent: mode === Mode.CARD && alignmentCenter && "center",
    gap: "0.875em",
  } as const;
};

export const getOptionsStyles = () => {
  return {
    width: "10em",
    minWidth: "10em",
    padding: "0px",
    minHeight: "max-content",
    height: "max-content",
    boxSizing: "border-box",
    color: "#000",
    fontFamily: "Helvetica Neue",
    fontStyle: "normal",
  } as const;
};
