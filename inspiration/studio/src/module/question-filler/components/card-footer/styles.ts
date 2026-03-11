import { ViewPort, Mode } from "@src/module/constants";

export const getContainerStyles = ({ viewPort, mode }) => {
  const getPadding = () => {
    if (viewPort === ViewPort.DESKTOP) return "1em 3em";

    return "1em 1.5em";
  };
  return {
    padding: getPadding(),
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    fontFamily: "Proxima Nova",
    position: "absolute",
    gap: viewPort === ViewPort.MOBILE ? "1.5em" : "2.5em",
    right: 0,
    zIndex: 3,
  } as const;
};

export const getButtonContainerStyles = () => {
  return {
    width: "6.75em",
    height: "3em",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75em",
  } as const;
};

export const getButtonIconStyles = ({
  theme = {},
  disabled = false,
}: {
  theme: any;
  disabled?: boolean;
}) => {
  return {
    padding: ".7em",
    width: "3em",
    height: "3em",
    background: theme?.buttonBgColor,
    borderRadius: "0.375em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    opacity: disabled ? "0.8" : "1",
  };
};
