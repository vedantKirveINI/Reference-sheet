import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { Bug, Eye, AlertTriangle } from "lucide-react";
import { LOG_TYPE } from "../constants/types";

export const LOG_TYPE_V2 = LOG_TYPE;

export const LOG_V2_NODE = {
  _src: extensionIcons.logIcon,
  name: "Log",
  type: LOG_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#2563EB",
  foreground: "#fff",
  dark: "#1D4ED8",
  light: "#2563EB",
  hasTestModule: false,
};

export const THEME = {
  primaryButtonBg: "#1D4ED8",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(37, 99, 235, 0.08)",
  iconBorder: "rgba(37, 99, 235, 0.15)",
  iconColor: "#2563EB",
  accentColor: "#1C3693",
};

export const LOG_LEVELS = [
  { 
    id: "INFO", 
    label: "Info", 
    description: "General information messages",
    color: "#3b82f6"
  },
  { 
    id: "DEBUG", 
    label: "Debug", 
    description: "Detailed debugging information",
    color: "#8b5cf6"
  },
  { 
    id: "WARN", 
    label: "Warning", 
    description: "Warning messages for potential issues",
    color: "#f59e0b"
  },
  { 
    id: "ERROR", 
    label: "Error", 
    description: "Error messages for failures",
    color: "#ef4444"
  },
];

export const LOG_TEMPLATES = [
  {
    id: "variable-check",
    name: "Check Variable",
    description: "Log a variable's value to verify data flow",
    icon: Bug,
    defaults: {
      logType: "DEBUG",
      content: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "api-response",
    name: "API Response",
    description: "Log API responses for debugging integrations",
    icon: Eye,
    defaults: {
      logType: "INFO",
      content: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "API Response: " }] },
    },
  },
  {
    id: "error-tracking",
    name: "Error Tracking",
    description: "Log errors with context for troubleshooting",
    icon: AlertTriangle,
    defaults: {
      logType: "ERROR",
      content: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Error: " }] },
    },
  },
];
