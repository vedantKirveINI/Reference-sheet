import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const START_NODE_V2_TYPE = "START_NODE_V2";

export const THEME = {
  primaryButtonBg: "#16a34a",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(34, 197, 94, 0.08)",
  iconBorder: "rgba(34, 197, 94, 0.15)",
  iconColor: "#22C55E",
};

export const TABS = { CONFIGURE: "configure", TEST: "test" };

export const START_NODE_V2 = {
  cmsId: "start-v2",
  _src: extensionIcons.startIcon,
  name: "Start",
  type: START_NODE_V2_TYPE,
  template: NODE_TEMPLATES.START,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16a34a",
  light: "#22C55E",
  hasTestModule: true,
  denyFromLink: true,
};

export const START_TYPES = [
  {
    id: "manual",
    label: "Manual",
    description: "Trigger workflow manually via Run button",
    color: "#22C55E",
  },
  {
    id: "scheduled",
    label: "Scheduled",
    description: "Run workflow on a schedule",
    color: "#3b82f6",
  },
  {
    id: "webhook",
    label: "Webhook",
    description: "Trigger workflow via API endpoint",
    color: "#8b5cf6",
  },
];

export const START_TEMPLATES = [
  {
    id: "manual-start",
    name: "Manual Start",
    description: "Start workflow with the Run button",
    icon: "Play",
    defaults: {
      startType: "manual",
      variables: [],
      inputSchema: null,
    },
  },
  {
    id: "scheduled-start",
    name: "Scheduled Start",
    description: "Run workflow on a recurring schedule",
    icon: "Clock",
    defaults: {
      startType: "scheduled",
      variables: [],
      inputSchema: null,
    },
  },
  {
    id: "webhook-start",
    name: "Webhook Start",
    description: "Trigger workflow from external API calls",
    icon: "Webhook",
    defaults: {
      startType: "webhook",
      variables: [],
      inputSchema: null,
    },
  },
];
