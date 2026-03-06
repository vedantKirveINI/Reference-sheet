export const FIX_WITH_AI_EVENT = "WORKFLOW_AI_FIX_NODE";

export function emitFixWithAI(nodeId, workflowId = null, context = {}) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent(FIX_WITH_AI_EVENT, {
      detail: { nodeId, workflowId, ...context },
    });
    window.dispatchEvent(event);
  }
}

export function buildFixWithAIPrompt(detail) {
  const { nodeName, nodeType, errors = [], warnings = [] } = detail;
  const label = nodeName || nodeType || "this node";
  const parts = [`I need help fixing issues with the "${label}" node.`];

  if (errors.length > 0) {
    parts.push(`\nErrors:\n${errors.map((e) => `- ${e}`).join("\n")}`);
  }
  if (warnings.length > 0) {
    parts.push(`\nWarnings:\n${warnings.map((w) => `- ${w}`).join("\n")}`);
  }

  parts.push("\nPlease explain what's wrong and how to fix each issue step by step.");
  return parts.join("");
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
