/**
 * Handle add_node quick-action.
 * Resolves display name to type via displayNameToType, adds node to diagram.
 */

import { getNodeTypeFromDisplayName } from "./displayNameToType.js";
import { NODE_TEMPLATES } from "../../canvas/templates/nodeTemplates.js";

/**
 * @param {object} params
 * @param {object} params.diagram - GoJS diagram
 * @param {object} params.action - { type: "add_node", param: string, config?: object }
 * @param {string} params.canvasType - WORKFLOW_CANVAS | WC_CANVAS
 * @param {function} [params.saveNodeDataHandler] - (nodeData, go_data, ...) => void
 * @param {function} params.resolveNodeDefaults - (nodeType) => { frontendType, template, _src }
 * @param {function} params.setMessages - React setState for messages
 */
export function handleAddNode({
  diagram,
  action,
  canvasType,
  saveNodeDataHandler,
  resolveNodeDefaults,
  setMessages,
}) {
  const displayName = action?.param;
  if (!displayName) return;

  const nodeType = getNodeTypeFromDisplayName(displayName, canvasType);
  const key = `node_${Date.now()}`;
  const existingNodes = diagram.model.nodeDataArray || [];
  const lastNode = existingNodes[existingNodes.length - 1];
  let x = 200;
  let y = 250;
  if (lastNode?.location) {
    const parts = String(lastNode.location).split(" ");
    x = parseInt(parts[0], 10) || 200;
    y = (parseInt(parts[1], 10) || 150) + 120;
  }
  const resolvedAction = resolveNodeDefaults(nodeType);
  diagram.model.addNodeData({
    key,
    type: resolvedAction?.frontendType || nodeType,
    subType: resolvedAction?.frontendType || nodeType,
    name: displayName,
    text: displayName,
    template: resolvedAction?.template || NODE_TEMPLATES.CIRCLE,
    category: resolvedAction?.frontendType || nodeType,
    _src: resolvedAction?._src || "",
    location: `${x} ${y}`,
  });
  const addedNodeData = diagram.model.nodeDataArray?.find((n) => n.key === key);
  if (
    addedNodeData &&
    action.config &&
    typeof action.config === "object" &&
    Object.keys(action.config).length > 0 &&
    saveNodeDataHandler
  ) {
    try {
      saveNodeDataHandler(addedNodeData, { ...(addedNodeData.go_data || {}), ...action.config }, {}, false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Done! I've added a "${displayName}" node and applied suggested configuration. Review and save if needed.`,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Done! I've added a "${displayName}" node to your canvas. Click on it to configure its settings.`,
        },
      ]);
    }
  } else {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `Done! I've added a "${displayName}" node to your canvas. Click on it to configure its settings.`,
      },
    ]);
  }
}
