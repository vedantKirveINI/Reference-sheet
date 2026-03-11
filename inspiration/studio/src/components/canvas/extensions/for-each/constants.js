import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const FOR_EACH_TYPE = "FOR_EACH";

export const FOR_EACH_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742550036580/iterator.svg",
  name: "For Each",
  type: FOR_EACH_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#F97316",
  foreground: "#fff",
  dark: "#EA580C",
  light: "#F97316",
  hasTestModule: false,
  isPaired: true,
  pairedType: "LOOP_END",
  meta: {
    search_keys: ["Loop", "Iterate", "List", "Each", "Batch", "For Each", "Loop through"],
  },
};

export const THEME = {
  primaryButtonBg: "#EA580C",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(249, 115, 22, 0.08)",
  iconBorder: "rgba(249, 115, 22, 0.15)",
  iconColor: "#F97316",
};
