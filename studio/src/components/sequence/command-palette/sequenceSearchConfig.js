import { SEQUENCE_NODE_DESCRIPTIONS } from "./nodeDescriptions";
import { SEQUENCE_NODE_COLORS, SEQUENCE_NODE_TEMPLATES } from "../constants";

const CATEGORY_LABELS = {
  trigger: "Triggers",
  action: "Actions",
  flow: "Flow Control",
};

export const getSequenceSearchConfig = () => {
  const groups = {};

  Object.values(SEQUENCE_NODE_DESCRIPTIONS).forEach((node) => {
    if (node.hidden) return;

    const category = node.category || "action";
    if (!groups[category]) {
      groups[category] = [];
    }

    const colors = SEQUENCE_NODE_COLORS[node.id] || { bg: "#F5F5F5", border: "#9E9E9E", accent: "#616161" };

    groups[category].push({
      name: node.title,
      type: node.id,
      _src: node._src,
      template: SEQUENCE_NODE_TEMPLATES[node.id] || "sequenceNode",
      description: node.tagline,
      background: colors.accent,
      foreground: "#fff",
      _sequenceNode: true,
      _sequenceDescription: node,
    });
  });

  const categoryOrder = ["trigger", "action", "flow"];
  return categoryOrder
    .filter(cat => groups[cat]?.length > 0)
    .map(cat => ({
      label: CATEGORY_LABELS[cat],
      components: groups[cat],
    }));
};
