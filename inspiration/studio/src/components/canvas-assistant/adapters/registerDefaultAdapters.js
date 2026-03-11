import { registerCanvasAdapter, defaultCanvasAdapter } from "./canvasAdapterRegistry.js";

// Form canvas (your project uses WORKFLOW_CANVAS as Form mode)
registerCanvasAdapter("WORKFLOW_CANVAS", {
  ...defaultCanvasAdapter,
  blockedActions: ["add_trigger"],
  rulesText() {
    return [
      "- This is Form canvas.",
      "- No trigger nodes are allowed.",
      "- WELCOME must be first; ENDING must be last.",
      "- Prefer question nodes and allowed shared nodes.",
    ].join("\n");
  },
});

// Workflow canvas
registerCanvasAdapter("WC_CANVAS", {
  ...defaultCanvasAdapter,
  blockedActions: [],
  rulesText() {
    return [
      "- This is Workflow canvas.",
      "- Triggers may be required depending on flow.",
      "- Use allowed workflow nodes.",
    ].join("\n");
  },
});
