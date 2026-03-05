import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const REPEAT_TYPE = "REPEAT";

export const REPEAT_COUNT_MIN = 1;
export const REPEAT_COUNT_MAX = 1000;

export const REPEAT_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742550036580/iterator.svg",
  name: "Repeat",
  type: REPEAT_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#4F46E5",
  foreground: "#fff",
  dark: "#4338CA",
  light: "#4F46E5",
  hasTestModule: false,
  isPaired: true,
  pairedType: "LOOP_END",
  meta: {
    search_keys: ["Loop", "Repeat", "Count", "Times", "Fixed", "Loop count"],
  },
};

export const THEME = {
  primaryButtonBg: "#4338CA",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(79, 70, 229, 0.08)",
  iconBorder: "rgba(79, 70, 229, 0.15)",
  iconColor: "#4F46E5",
};
