import {
  ClipboardList,
  GitBranch,
  Cable,
  Newspaper,
  Bot,
  Wrench,
} from "lucide-react";
import { MODE } from "../../../constants/mode";

export const MODE_CONFIG = {
  [MODE.WORKFLOW_CANVAS]: {
    id: "forms",
    label: "Form",
    icon: "OUTEFormIcon",
    primaryAction: "previewAndPublish",
    secondaryAction: null,
    showMetrics: false,
    showActiveToggle: false,
    showOnlineToggle: false,
    showResponsePill: true,
    metrics: ["responses", "today"],
  },
  [MODE.WC_CANVAS]: {
    id: "workflows",
    label: "Workflow",
    icon: "OUTEWorkflowIcon",
    primaryAction: "test",
    secondaryAction: "logs",
    showMetrics: true,
    showActiveToggle: true,
    showOnlineToggle: false,
    metrics: ["runs", "successRate"],
  },
  [MODE.INTEGRATION_CANVAS]: {
    id: "integrations",
    label: "Integration",
    icon: "OUTEWorkflowIcon",
    primaryAction: "test",
    secondaryAction: "logs",
    showMetrics: true,
    showActiveToggle: false,
    showOnlineToggle: false,
    metrics: ["apiCalls", "errorRate"],
  },
  [MODE.CMS_CANVAS]: {
    id: "cms",
    label: "CMS",
    icon: "OUTECMSIcon",
    primaryAction: "preview",
    secondaryAction: null,
    showMetrics: false,
    showActiveToggle: false,
    showOnlineToggle: false,
  },
  [MODE.AGENT_CANVAS]: {
    id: "agents",
    label: "Agent",
    icon: "TinyAgentLogo",
    primaryAction: "chatTest",
    secondaryAction: "logs",
    showMetrics: true,
    showActiveToggle: false,
    showOnlineToggle: true,
    metrics: ["messages", "sessions"],
  },
  [MODE.TOOL_CANVAS]: {
    id: "tools",
    label: "Tool",
    icon: "TinyAgentLogo",
    primaryAction: "test",
    secondaryAction: null,
    showMetrics: false,
    showActiveToggle: false,
    showOnlineToggle: false,
  },
  [MODE.SEQUENCE_CANVAS]: {
    id: "sequences",
    label: "Sequence",
    icon: "OUTEScheduleIcon",
    primaryAction: "run",
    secondaryAction: "logs",
    showMetrics: false,
    showActiveToggle: false,
    showOnlineToggle: false,
    metrics: ["runs", "successRate"],
  },
};

export const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  published: {
    label: "Published",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  running: {
    label: "Running",
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    animate: true,
  },
  error: {
    label: "Error",
    dotColor: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
  inactive: {
    label: "Inactive",
    dotColor: "bg-gray-400",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
    borderColor: "border-gray-200",
  },
};

export const getStatus = ({
  isDraft,
  isPublished,
  isRunning,
  hasErrors,
  isInactive,
}) => {
  if (isRunning) return "running";
  if (hasErrors) return "error";
  if (isInactive) return "inactive";
  if (isDraft) return "draft";
  if (isPublished) return "published";
  return "draft";
};

export const getDefaultConfig = () => MODE_CONFIG[MODE.WORKFLOW_CANVAS];

export const MODE_COLORS = {
  [MODE.WORKFLOW_CANVAS]: {
    primary: "#FFBA08",
    gradient: "linear-gradient(135deg, #FFBA08, #FF7B52)",
    bg: "#FFBA08",
    bgSubtle: "rgba(255, 186, 8, 0.08)",
    border: "rgba(255, 186, 8, 0.3)",
    text: "#b58406",
    buttonBg: "#F59E0B",
    buttonHover: "#D97706",
  },
  [MODE.WC_CANVAS]: {
    primary: "#358CFF",
    gradient: "linear-gradient(135deg, #358CFF, #1C3693)",
    bg: "#358CFF",
    bgSubtle: "rgba(53, 140, 255, 0.08)",
    border: "rgba(53, 140, 255, 0.3)",
    text: "#1C3693",
    buttonBg: "#358CFF",
    buttonHover: "#1C6FE0",
  },
  [MODE.INTEGRATION_CANVAS]: {
    primary: "#358CFF",
    gradient: "linear-gradient(135deg, #358CFF, #1C3693)",
    bg: "#358CFF",
    bgSubtle: "rgba(53, 140, 255, 0.08)",
    border: "rgba(53, 140, 255, 0.3)",
    text: "#1C3693",
    buttonBg: "#358CFF",
    buttonHover: "#1C6FE0",
  },
  [MODE.CMS_CANVAS]: {
    primary: "#EA59ED",
    gradient: "linear-gradient(135deg, #EA59ED, #C026D3)",
    bg: "#EA59ED",
    bgSubtle: "rgba(234, 89, 237, 0.08)",
    border: "rgba(234, 89, 237, 0.3)",
    text: "#A21CAF",
    buttonBg: "#EA59ED",
    buttonHover: "#C026D3",
  },
  [MODE.AGENT_CANVAS]: {
    primary: "#8133F1",
    gradient: "linear-gradient(135deg, #8133F1, #360083)",
    bg: "#8133F1",
    bgSubtle: "rgba(129, 51, 241, 0.08)",
    border: "rgba(129, 51, 241, 0.3)",
    text: "#360083",
    buttonBg: "#8133F1",
    buttonHover: "#6B21C8",
  },
  [MODE.TOOL_CANVAS]: {
    primary: "#8133F1",
    gradient: "linear-gradient(135deg, #8133F1, #360083)",
    bg: "#8133F1",
    bgSubtle: "rgba(129, 51, 241, 0.08)",
    border: "rgba(129, 51, 241, 0.3)",
    text: "#360083",
    buttonBg: "#8133F1",
    buttonHover: "#6B21C8",
  },
  [MODE.SEQUENCE_CANVAS]: {
    primary: "#1C3693",
    gradient: "linear-gradient(135deg, #90A4AE, #1C3693)",
    bg: "#1C3693",
    bgSubtle: "rgba(28, 54, 147, 0.08)",
    border: "rgba(28, 54, 147, 0.3)",
    text: "#1C3693",
    buttonBg: "#1C3693",
    buttonHover: "#152A75",
  },
};
