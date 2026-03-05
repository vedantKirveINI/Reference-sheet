import { ViewPort, Mode } from "@src/module/constants";

export const getContainerStyles = ({
  viewPort,
  hideBrandingButton = false,
}) => {
  const getPadding = () => {
    if (viewPort === ViewPort.DESKTOP) return "1% 26%";

    return "1em 1.5em";
  };
  return {
    padding: getPadding(),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "Proxima Nova",
    ...(hideBrandingButton && {
      justifyContent: "flex-end",
    }),
  } as const;
};
