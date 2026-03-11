import { SEND_EMAIL_TO_YOURSELF_V2_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const SEND_EMAIL_TO_YOURSELF_V2_NODE = {
  cmsId: "send-email-to-yourself-v2",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1757569290393/3178158.png",
  name: "Send Email to Yourself",
  type: SEND_EMAIL_TO_YOURSELF_V2_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#06B6D4",
  foreground: "#fff",
  dark: "#0891b2",
  light: "#06B6D4",
  hasTestModule: true,
  canSkipTest: false,
};

export const TABS = {
  INITIALISE: 0,
  CONFIGURE: 1,
  TEST: 2,
};

export const THEME = {
  headerBg: "bg-cyan-500",
  primaryButtonBg: "bg-cyan-500 hover:bg-cyan-600",
  activeTabBg: "bg-cyan-500",
  activeTabText: "text-white",
  accentColor: "#06B6D4",
};

export const EMAIL_PRIORITIES = [
  {
    id: "LOW",
    label: "Low",
    description: "Non-urgent notifications",
    color: "#22c55e",
  },
  {
    id: "NORMAL",
    label: "Normal",
    description: "Standard priority emails",
    color: "#3b82f6",
  },
  {
    id: "HIGH",
    label: "High",
    description: "Important notifications",
    color: "#f59e0b",
  },
  {
    id: "URGENT",
    label: "Urgent",
    description: "Critical alerts requiring attention",
    color: "#ef4444",
  },
];

export const EMAIL_TEMPLATES = [
  {
    id: "error-alert",
    name: "Error Alert",
    description: "Get notified when errors occur in your workflow",
    icon: "AlertTriangle",
    defaults: {
      priority: "HIGH",
      subject: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "[Error] Workflow Alert" }] },
      body: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "An error occurred in your workflow. Please check the logs for details." }] },
    },
  },
  {
    id: "completion-notice",
    name: "Completion Notice",
    description: "Receive confirmation when tasks complete successfully",
    icon: "CheckCircle",
    defaults: {
      priority: "NORMAL",
      subject: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "[Complete] Task Finished" }] },
      body: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Your workflow task has completed successfully." }] },
    },
  },
  {
    id: "daily-summary",
    name: "Daily Summary",
    description: "Aggregate important events into a summary email",
    icon: "Calendar",
    defaults: {
      priority: "LOW",
      subject: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "[Summary] Daily Report" }] },
      body: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Here is your daily summary of workflow activity." }] },
    },
  },
];

export const getEmailTemplateById = (templateId) => {
  return EMAIL_TEMPLATES.find((t) => t.id === templateId);
};
