import { hexToRgba } from "../../utils/hex-to-rgba";
import { Mode, ViewPort } from "@src/module/constants";

export const containerStyles = ({ theme = {}, mode }: any) => {
  const background = theme?.buttonBgColor || "#D70090";
  return {
    display: "flex",
    height: "3em",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "0.375em",
    background: background,
    overflow: "hidden",
    cursor: "pointer",
    textDecoration: "none",
  } as const;
};

export const getLabelStyles = ({ theme = {} }: any) => {
  const color = theme?.buttonTextColor || "#FFFFFF";
  const background = theme?.buttonBgColor || "#D70090";
  return {
    paddingLeft: "1.5em",
    background: background,
    color: color,
    fontFamily: '"Helvetica Neue"',
    fontSize: "1.25em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "110%",
  };
};

export const getLogoContainerStyles = ({ theme = {}, viewPort }: any) => {
  const background = theme?.buttonBgColor;

  return {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: background,
    padding: viewPort === ViewPort.MOBILE && "1em",
  };
};

export const getDesktopLogoContainerStyles = () => {
  return {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "0.375em 0.75em",
  } as const;
};

export const getDesktopLogoTextStyles = ({ theme }) => {
  return {
    fontSize: "0.75em",
    fontWeight: "600",
    lineHeight: "1.25em",
    fontFamily: "Inter",
    marginTop: "0.375em",
    color: theme.buttonTextColor,
    opacity: 0.8,
  };
};

export const getDesktopLogoStyles = () => {
  return {
    width: "7.608em",
    height: "1.375em",
  };
};

export const getMobileLogoContainerStyles = () => {
  return {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1em",
  };
};

export const getMobileLogoStyles = () => {
  return {
    width: "1.5em",
    height: "1.5em",
  };
};
