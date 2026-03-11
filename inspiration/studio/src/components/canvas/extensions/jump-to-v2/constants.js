import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { JUMP_TO_TYPE } from "../constants/types";

export const JUMP_TO_TYPE_V2 =JUMP_TO_TYPE;

export const THEME = {
  primaryButtonBg: "#7c3aed",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(139, 92, 246, 0.08)",
  iconBorder: "rgba(139, 92, 246, 0.15)",
  iconColor: "#8B5CF6",
};

export const JUMP_TO_V2_NODE = {
  _src: extensionIcons.jumpToIcon || "https://cdn-v1.tinycommand.com/1234567890/1742550036580/iterator.svg",
  name: "Jump To",
  type: JUMP_TO_TYPE_V2,
  template: NODE_TEMPLATES.END,
  background: "#8B5CF6",
  foreground: "#fff",
  dark: "#7c3aed",
  light: "#8B5CF6",
  hasTestModule: false,
  denyFromLink: false,
  denyToLink: true,
};
