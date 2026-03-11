/**
 * Action registry: central definitions for canvas actions.
 * Maps step kinds (from plan schema) to action kinds (for execution).
 */

export const ACTION_DEFINITIONS = {
  add_nodes: {
    id: "add_nodes",
    description: "Append nodes to the end of the flow",
    stepKind: "add_or_insert",
    requiredContext: ["planNodes", "createNodeData"],
    optionalContext: ["insertMode", "anchorNodeKey"],
    riskLevel: "low",
    supportsUndo: true,
  },
  insert_after: {
    id: "insert_after",
    description: "Insert nodes after an anchor node",
    stepKind: "add_or_insert",
    requiredContext: ["planNodes", "createNodeData", "anchorNodeKey"],
    optionalContext: [],
    riskLevel: "low",
    supportsUndo: true,
  },
  insert_before: {
    id: "insert_before",
    description: "Insert nodes before an anchor node",
    stepKind: "add_or_insert",
    requiredContext: ["planNodes", "createNodeData", "anchorNodeKey"],
    optionalContext: [],
    riskLevel: "low",
    supportsUndo: true,
  },
  remove_node: {
    id: "remove_node",
    description: "Remove a node and rewire connections",
    stepKind: "remove",
    requiredContext: ["targetNodeKey"],
    optionalContext: [],
    riskLevel: "high",
    supportsUndo: true,
  },
  update_node: {
    id: "update_node",
    description: "Update node properties (name, config, go_data)",
    stepKind: "update",
    requiredContext: ["targetNodeKey", "payload"],
    optionalContext: [],
    riskLevel: "low",
    supportsUndo: true,
  },
  replace_graph: {
    id: "replace_graph",
    description: "Clear canvas and rebuild with new nodes",
    stepKind: "build",
    requiredContext: ["planNodes", "createNodeData"],
    optionalContext: [],
    riskLevel: "high",
    supportsUndo: false,
  },
  add_trigger: {
    id: "add_trigger",
    description: "Add a Manual Trigger node (legacy quick-action)",
    stepKind: null,
    requiredContext: [],
    optionalContext: [],
    riskLevel: "low",
    supportsUndo: true,
  },
  connect_nodes: {
    id: "connect_nodes",
    description: "Auto-connect sequential nodes",
    stepKind: null,
    requiredContext: [],
    optionalContext: [],
    riskLevel: "low",
    supportsUndo: true,
  },
};

/**
 * Map from plan step kind to action kind(s).
 * For add_or_insert, the actual action depends on step.insertMode.
 */
export const STEP_KIND_TO_ACTION_KIND = {
  add_or_insert: (step) => {
    const mode = step?.insertMode;
    if (mode === "insert_after") return "insert_after";
    if (mode === "insert_before") return "insert_before";
    return "add_nodes";
  },
  build: "add_nodes",
  remove: "remove_node",
  update: "update_node",
  replace_node: "replace_node",
  explain: null,
};

export function getActionDefinition(actionId) {
  return ACTION_DEFINITIONS[actionId] ?? null;
}

export function getActionIdsForStepKind(stepKind) {
  const defs = Object.values(ACTION_DEFINITIONS).filter((d) => d.stepKind === stepKind);
  return defs.map((d) => d.id);
}
