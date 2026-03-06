import { IF_ELSE_TYPE_V2 } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const THEME = {
  primaryButtonBg: "#0038C8",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(0, 56, 200, 0.08)",
  iconBorder: "rgba(0, 56, 200, 0.15)",
  iconColor: "#0038C8",
};

export const TABS = {
  CONFIGURE: "configure",
  TEST: "test",
};

export const IF_ELSE_NODE_V2 = {
  cmsId: "if-else",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742541487770/Ifelse.svg",
  name: "If Else v2",
  type: IF_ELSE_TYPE_V2,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(181deg, #0038C8 0%, #799EFF 129.04%)",
  foreground: "#fff",
  dark: "#0038C8",
  light: "#799EFF",
  hasTestModule: true,
  meta: {
    search_keys: ["Alston", "If Else", "If Else V2"],
  },
  canSkipTest: true,
};

export { IF_ELSE_TYPE_V2 };
