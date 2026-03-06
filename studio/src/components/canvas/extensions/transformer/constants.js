import { TRANSFORMER_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export { TRANSFORMER_TYPE };

export const THEME = {
  primaryButtonBg: "#1D4ED8",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(37, 99, 235, 0.08)",
  iconBorder: "rgba(37, 99, 235, 0.15)",
  iconColor: "#2563EB",
  accentColor: "#1C3693",
};

export const TABS = { CONFIGURE: "configure", TEST: "test" };

export const TRANSFORMER_NODE = {
  cmsId: "transformer-v3",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742541673656/fx.svg",
  name: "Transformer",
  type: TRANSFORMER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#2563EB",
  foreground: "#fff",
  dark: "#1D4ED8",
  light: "#2563EB",
  hasTestModule: true,
  meta: {
    search_keys: [
      "Transform",
      "Formula",
      "Merge",
      "Calculate",
      "Format",
      "Extract",
      "Concat",
      "V3",
    ],
  },
};
