export const FIX_WITH_AI_EVENT = "WORKFLOW_AI_FIX_NODE";

export function emitFixWithAI(nodeId, workflowId = null) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent(FIX_WITH_AI_EVENT, {
      detail: { nodeId, workflowId },
    });
    window.dispatchEvent(event);
  }
}

export function createFixWithAIMenuItem(nodeId, workflowId = null) {
  return {
    label: "Fix with AI",
    icon: "✨",
    action: () => {
      emitFixWithAI(nodeId, workflowId);
    },
    disabled: false,
    tooltip: "Use AI to fix issues with this node",
  };
}

export function addFixWithAIToContextMenu(existingItems, nodeId, workflowId = null) {
  const fixItem = createFixWithAIMenuItem(nodeId, workflowId);
  
  const divider = { type: "divider" };
  
  return [...existingItems, divider, fixItem];
}
