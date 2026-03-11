import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const ARRAY_AGGREGATOR_TYPE_V2 = "ARRAY_AGGREGATOR_V2";

export const ARRAY_AGGREGATOR_V2_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742543022007/aggregrator.svg",
  name: "Array Aggregator",
  description: "Collect results from Iterator back into a single array",
  type: ARRAY_AGGREGATOR_TYPE_V2,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#14B8A6",
  foreground: "#fff",
  dark: "#0d9488",
  light: "#14B8A6",
  hasTestModule: true,
};

export const THEME = {
  primaryButtonBg: "#0d9488",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(20, 184, 166, 0.08)",
  iconBorder: "rgba(20, 184, 166, 0.15)",
  iconColor: "#14B8A6",
};

export const TABS = {
  CONFIGURE: "configure",
  TEST: "test",
};

export const AGGREGATOR_TEMPLATES = [
  {
    id: "collect-results",
    name: "Collect results",
    description: "Gather all processed items back into a single array",
    icon: "Layers",
    defaults: {
      source: null,
      mapping: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "merge-responses",
    name: "Merge responses",
    description: "Combine multiple API responses into one unified array",
    icon: "Merge",
    defaults: {
      source: null,
      mapping: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
];
