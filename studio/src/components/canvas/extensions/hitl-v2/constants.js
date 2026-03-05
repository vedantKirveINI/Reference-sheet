import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { HITL_TYPE } from "../constants/types";

export const HITL_V2_TYPE = "HITL_V2";

export const THEME = {
  primaryButtonBg: "#1D4ED8",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(37, 99, 235, 0.08)",
  iconBorder: "rgba(37, 99, 235, 0.15)",
  iconColor: "#2563EB",
  accentColor: "#1C3693",
};

export const TABS = { INITIALISE: "initialise", CONFIGURE: "configure", TEST: "test" };

/** Node uses type HITL for backend compatibility; UI is the V2 drawer. */
export const HITL_V2_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1745997356118/Human%20in%20the%20loop%20icon.svg",
  name: "Human-in-the-Loop",
  type: HITL_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#2563EB",
  foreground: "#fff",
  dark: "#1D4ED8",
  light: "#2563EB",
  hasTestModule: true,
};

export const BUTTON_COLORS = [
  { id: "green", label: "Green", hex: "#22c55e" },
  { id: "red", label: "Red", hex: "#ef4444" },
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "orange", label: "Orange", hex: "#f59e0b" },
  { id: "gray", label: "Gray", hex: "#6b7280" },
  { id: "purple", label: "Purple", hex: "#8b5cf6" },
];

export const TIMEOUT_UNITS = [
  { id: "minutes", label: "Minutes" },
  { id: "hours", label: "Hours" },
  { id: "days", label: "Days" },
];

// Legacy template buttons (for backward compatibility)
export const TEMPLATE_BUTTONS = {
  approval: [
    { label: "Approve", value: "Approve", color: "green" },
    { label: "Reject", value: "Reject", color: "red" },
  ],
  categorization: [
    { label: "Stage 1", value: "Stage 1", color: "blue" },
    { label: "Stage 2", value: "Stage 2", color: "orange" },
    { label: "Stage 3", value: "Stage 3", color: "gray" },
  ],
  escalation: [
    { label: "Escalate", value: "Escalate", color: "red" },
    { label: "Forward", value: "Forward", color: "blue" },
    { label: "Defer", value: "Defer", color: "gray" },
  ],
};

export const HITL_V2_TEMPLATES = [
  {
    id: "approval-request",
    name: "Approval Request",
    description: "Request approval or rejection for a workflow step",
    icon: "CheckCircle",
    defaults: {
      title: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Approval Required" }] },
      instructions: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Please review and approve or reject this request." }] },
      summaryContent: { type: "fx", blocks: [] },
      buttons: [
        { label: "Approve", value: "approve", color: "green" },
        { label: "Reject", value: "reject", color: "red" },
      ],
      timeout: { enabled: false, duration: 24, unit: "hours" },
    },
  },
  {
    id: "data-review",
    name: "Data Review",
    description: "Have a human review and validate data before proceeding",
    icon: "FileSearch",
    defaults: {
      title: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Data Review Required" }] },
      instructions: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Please review the following data and confirm accuracy." }] },
      summaryContent: { type: "fx", blocks: [] },
      buttons: [
        { label: "Confirm", value: "confirm", color: "green" },
        { label: "Request Changes", value: "request_changes", color: "orange" },
        { label: "Reject", value: "reject", color: "red" },
      ],
      timeout: { enabled: false, duration: 48, unit: "hours" },
    },
  },
  {
    id: "manual-input",
    name: "Manual Input",
    description: "Pause workflow to collect manual input from a user",
    icon: "Edit",
    defaults: {
      title: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Input Required" }] },
      instructions: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Please provide the required information to continue." }] },
      summaryContent: { type: "fx", blocks: [] },
      buttons: [
        { label: "Submit", value: "submit", color: "blue" },
        { label: "Cancel", value: "cancel", color: "gray" },
      ],
      timeout: { enabled: false, duration: 72, unit: "hours" },
    },
  },
];
