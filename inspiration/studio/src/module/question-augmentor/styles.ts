import { Mode, ViewPort } from "@oute/oute-ds.core.constants";

const getPadding = ({ viewPort, mode, isCreator }) => {
  if (mode === Mode.CLASSIC && viewPort == ViewPort.MOBILE && isCreator)
    return "0em 1.5em 0em 1.5em";
  if (viewPort === ViewPort.MOBILE || mode === Mode.CHAT) return 0;
  if (mode === Mode.CARD) return 0;
  return "1.5em 1.5em 1.5em 1em";
};

const getBorderRadius = ({ viewPort, mode, isCreator }) => {
  if (mode === Mode.CHAT) return "1.25em 1.25em 0 0";
  if (mode === Mode.CLASSIC && viewPort === ViewPort.DESKTOP) return "0.375em";
  if (mode === Mode.CLASSIC && viewPort === ViewPort.MOBILE && isCreator)
    return "0.375em";
  return 0;
};

export const getAugmentorWrapperStyle = ({
  viewPort,
  mode,
  style,
  isCreator,
}: any) => {
  return {
    width: viewPort === ViewPort.MOBILE || mode === Mode.CHAT ? "100%" : "50%",
    height: "100%",
    position: "relative",
    borderRadius: getBorderRadius({ viewPort, mode, isCreator }),
    padding: getPadding({ viewPort, mode, isCreator }),
    "&:hover .image-wrapper": {
      opacity: 0.5,
    },
    "&:hover .toolbar": {
      zIndex: 10,
      opacity: 1,
    },
    "& >:last-child": {
      padding: isCreator && getPadding({ viewPort, mode, isCreator }),
    },
    ...style,
  } as const;
};
export const getImageStyles = (options: any) => {
  const { viewPort, objectFit, mode, isCreator, opacity } = options;
  const opacityValue = opacity !== undefined && opacity !== null ? Number(opacity) / 100 : 1;
  return {
    width: "100%",
    height: "100%",
    borderRadius: getBorderRadius({ viewPort, mode, isCreator }),
    objectFit: objectFit,
    opacity: opacityValue,
  };
};
export const getImageWrapperHoverStyles = (options: any) => {
  const { viewPort, mode, isCreator } = options;
  return {
    position: "absolute" as const,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    opacity: 0,
    backgroundColor: "#7F7F7F",
    borderRadius: getBorderRadius({ viewPort, mode, isCreator }),
    margin: getPadding({ viewPort, mode, isCreator }),
    transition: "all .3s ease",
  };
};
