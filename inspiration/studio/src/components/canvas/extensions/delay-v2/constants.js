import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { DELAY_TYPE } from "../constants/types";

/** @deprecated Use DELAY_TYPE from constants/types.js. Kept for backward compat when reading old canvases. */
export const DELAY_TYPE_V2 = "DELAY_V2";

export const DELAY_V2_NODE = {
  _src: extensionIcons.delayIcon,
  name: "Delay",
  type: DELAY_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#F59E0B",
  foreground: "#fff",
  dark: "#D97706",
  light: "#F59E0B",
  hasTestModule: false,
};

export const THEME = {
  primaryButtonBg: "#D97706",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(245, 158, 11, 0.08)",
  iconBorder: "rgba(245, 158, 11, 0.15)",
  iconColor: "#D97706",
};
