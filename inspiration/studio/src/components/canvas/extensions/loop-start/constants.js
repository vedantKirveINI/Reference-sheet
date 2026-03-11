import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const LOOP_START_TYPE = "LOOP_START";

export const LOOP_START_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742550036580/iterator.svg",
  name: "Loop",
  type: LOOP_START_TYPE,
  template: NODE_TEMPLATES.LOOP_NODE,
  background: "#F97316",
  foreground: "#fff",
  dark: "#EA580C",
  light: "#F97316",
  hasTestModule: false,
  isPaired: true,
  pairedType: "LOOP_END",
};

export const THEME = {
  primaryButtonBg: "#EA580C",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(249, 115, 22, 0.08)",
  iconBorder: "rgba(249, 115, 22, 0.15)",
  iconColor: "#F97316",
};

export const LOOP_MODES = {
  LIST: "list",
  COUNT: "count",
  CONDITION: "condition",
};

export const CONDITION_OPERATORS = [
  { id: "equals", label: "Equals" },
  { id: "not_equals", label: "Does not equal" },
  { id: "greater_than", label: "Greater than" },
  { id: "less_than", label: "Less than" },
  { id: "is_true", label: "Is true" },
  { id: "is_false", label: "Is false" },
  { id: "exists", label: "Has a value" },
  { id: "not_exists", label: "Is empty" },
  { id: "contains", label: "Contains" },
];
