import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { BREAK_TYPE } from "../constants/types";

export const THEME = {
  primaryButtonBg: "#dc2626",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(239, 68, 68, 0.08)",
  iconBorder: "rgba(239, 68, 68, 0.15)",
  iconColor: "#EF4444",
};

export const BREAK_V2_NODE = {
  cmsId: "break-v2",
  name: "Stop Loop",
  type: BREAK_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#EF4444",
  foreground: "#fff",
  dark: "#dc2626",
  light: "#EF4444",
  hasTestModule: false,
  canSkipTest: true,
  denyToLink: true,
};
