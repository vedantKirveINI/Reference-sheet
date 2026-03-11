import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { SKIP_TYPE } from "../constants/types";

export const THEME = {
  primaryButtonBg: "#4f46e5",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(99, 102, 241, 0.08)",
  iconBorder: "rgba(99, 102, 241, 0.15)",
  iconColor: "#6366F1",
};

export const SKIP_V2_NODE = {
  cmsId: "skip-v2",
  name: "Skip",
  type: SKIP_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#6366F1",
  foreground: "#fff",
  dark: "#4f46e5",
  light: "#6366F1",
  hasTestModule: false,
  canSkipTest: true,
  denyToLink: true,
};
