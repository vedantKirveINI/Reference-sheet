const adapters = new Map();

export function registerCanvasAdapter(canvasType, adapter) {
  if (!canvasType || typeof canvasType !== "string") throw new Error("canvasType required");
  if (!adapter || typeof adapter !== "object") throw new Error("adapter required");
  adapters.set(canvasType, adapter);
}

export function getCanvasAdapter(canvasType) {
  return adapters.get(canvasType) || null;
}

function getBestNodeLabel(n) {
  const direct = n?.name || n?.text || n?.description;
  if (direct && typeof direct === "string" && direct.trim()) return direct;

  const gd = n?.go_data;
  if (gd && typeof gd === "object") {
    if (typeof gd.label === "string" && gd.label.trim()) return gd.label;
    if (typeof gd.question === "string" && gd.question.trim()) return gd.question;
    const settings = gd.settings;
    if (settings && typeof settings === "object" && typeof settings.label === "string" && settings.label.trim()) {
      return settings.label;
    }
  }

  return null;
}

/**
 * Default adapter: minimal behavior, safe fallbacks.
 */
export const defaultCanvasAdapter = {
  buildNodeIndex(diagram) {
    const nodes = diagram?.model?.nodeDataArray || [];
    return nodes.slice(0, 300).map((n) => ({
      key: n.key || n.id || null,
      type: n.type || null,
      subType: n.subType || null,
      label: getBestNodeLabel(n),
    }));
  },
  rulesText() {
    return "- Use allowed node types for this canvas.\n- Ask clarification when target is ambiguous.\n- Do not invent node types.";
  },
  supportedActions: [
    "add_nodes",
    "insert_after",
    "insert_before",
    "remove_node",
    "update_node",
    "replace_graph",
    "connect_nodes",
  ],
  blockedActions: [],
};

/**
 * Check if an action is allowed for the given canvas type.
 * @param {string} canvasType - Canvas type (e.g. WORKFLOW_CANVAS, WC_CANVAS)
 * @param {string} actionId - Action ID (e.g. add_trigger, add_nodes)
 * @returns {boolean} - true if action is allowed
 */
export function isActionAllowed(canvasType, actionId) {
  const adapter = getCanvasAdapter(canvasType) || defaultCanvasAdapter;
  const blocked = adapter.blockedActions || [];
  return !blocked.includes(actionId);
}
