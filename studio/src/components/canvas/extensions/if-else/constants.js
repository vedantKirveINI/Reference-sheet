import { IF_ELSE_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const THEME = {
  primaryButtonBg: "#D97706",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(245, 158, 11, 0.08)",
  iconBorder: "rgba(245, 158, 11, 0.15)",
  iconColor: "#F59E0B",
};

export const TABS = {
  CONFIGURE: "configure",
  TEST: "test",
};

export const IF_ELSE_NODE = {
  cmsId: "if-else",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742541487770/Ifelse.svg",
  name: "If-Else",
  type: IF_ELSE_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#F59E0B",
  foreground: "#fff",
  dark: "#D97706",
  light: "#F59E0B",
  hasTestModule: true,
  meta: {
    search_keys: ["If Else", "Conditional", "Branch", "Filter", "Route"],
  },
  canSkipTest: true,
};

export { IF_ELSE_TYPE };
