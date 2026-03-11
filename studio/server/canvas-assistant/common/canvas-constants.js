/**
 * Canvas type constants and mappings
 * Shared across all canvas types (Form, Workflow, Sequence, etc.)
 */

export const CANVAS_TYPES = {
  FORM_CANVAS: "WORKFLOW_CANVAS", // Form canvas uses WORKFLOW_CANVAS mode
  WORKFLOW_CANVAS: "WC_CANVAS",
  SEQUENCE_CANVAS: "SEQUENCE_CANVAS",
  INTEGRATION_CANVAS: "INTEGRATION_CANVAS",
  CMS_CANVAS: "CMS_CANVAS",
  AGENT_CANVAS: "AGENT_CANVAS",
  TOOL_CANVAS: "TOOL_CANVAS",
};

// Convenience constants for common canvas types
export const FORM_CANVAS_MODE = CANVAS_TYPES.FORM_CANVAS;
export const WORKFLOW_CANVAS_MODE = CANVAS_TYPES.WORKFLOW_CANVAS;
export const SEQUENCE_CANVAS_MODE = CANVAS_TYPES.SEQUENCE_CANVAS;
