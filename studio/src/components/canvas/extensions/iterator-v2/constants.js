import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const ITERATOR_TYPE_V2 = "ITERATOR_V2";

export const ITERATOR_V2_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742550036580/iterator.svg",
  name: "Iterator",
  description: "Loop through arrays, executing subsequent nodes for each item",
  type: ITERATOR_TYPE_V2,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#10B981",
  foreground: "#fff",
  dark: "#059669",
  light: "#10B981",
  hasTestModule: false,
};

export const THEME = {
  primaryButtonBg: "#059669",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(16, 185, 129, 0.08)",
  iconBorder: "rgba(16, 185, 129, 0.15)",
  iconColor: "#10B981",
};

export const ITERATOR_TEMPLATES = [
  {
    id: "loop-records",
    name: "Loop through records",
    description: "Iterate over database or sheet records to process each one",
    icon: "Database",
    defaults: {
      content: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "process-api",
    name: "Process API results",
    description: "Loop through API response arrays to handle each item",
    icon: "Globe",
    defaults: {
      content: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "batch-operations",
    name: "Batch operations",
    description: "Process items in bulk for emails, updates, or transformations",
    icon: "Layers",
    defaults: {
      content: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
];
