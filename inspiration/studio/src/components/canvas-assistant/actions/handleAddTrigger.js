/**
 * Handle add_trigger quick-action.
 * Blocked on Form canvas; adds Manual Trigger on Workflow canvas.
 */

/**
 * @param {object} params
 * @param {object} params.diagram - GoJS diagram
 * @param {string} params.canvasType - WORKFLOW_CANVAS | WC_CANVAS
 * @param {function} params.getCanvasAdapter - (canvasType) => adapter
 * @param {function} params.setMessages - React setState for messages
 */
export function handleAddTrigger({ diagram, canvasType, getCanvasAdapter, setMessages }) {
  const adapter = getCanvasAdapter?.(canvasType);
  const blockedActions = adapter?.blockedActions || [];

  if (blockedActions.includes("add_trigger")) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Triggers aren't used on the Form canvas — forms start when someone opens them. I can help you add form questions, fields, or actions (e.g. HTTP Request, Data Transformer) instead. For scheduled or event-driven flows, use the Workflow canvas.",
      },
    ]);
    return;
  }

  const key = `trigger_${Date.now()}`;
  diagram.model.addNodeData({
    key,
    type: "TRIGGER_SETUP_V3",
    subType: "TRIGGER_SETUP_V3",
    name: "Manual Trigger",
    text: "Manual Trigger",
    template: "TRIGGER_SETUP_V3",
    category: "TRIGGER_SETUP_V3",
    location: "200 100",
  });
  setMessages((prev) => [
    ...prev,
    {
      id: Date.now().toString(),
      role: "assistant",
      content:
        "Done! I've added a Manual Trigger to your canvas. Click on it to configure when your workflow should start.",
    },
  ]);
}
