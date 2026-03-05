import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const LOOP_UNTIL_TYPE = "LOOP_UNTIL";

export const LOOP_UNTIL_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742550036580/iterator.svg",
  name: "Loop Until",
  type: LOOP_UNTIL_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#7C3AED",
  foreground: "#fff",
  dark: "#6D28D9",
  light: "#7C3AED",
  hasTestModule: false,
  isPaired: true,
  pairedType: "LOOP_END",
  meta: {
    search_keys: ["Loop", "Until", "Condition", "While", "Loop until", "Conditional loop"],
  },
};

export const THEME = {
  primaryButtonBg: "#6D28D9",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(124, 58, 237, 0.08)",
  iconBorder: "rgba(124, 58, 237, 0.15)",
  iconColor: "#7C3AED",
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
