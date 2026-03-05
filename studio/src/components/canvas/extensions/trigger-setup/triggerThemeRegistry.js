import FormIcon from "../../../../assets/form.svg";
import TableIcon from "../../../../assets/table.svg";
import WorkflowIcon from "../../../../assets/workflow.svg";
import EmailIcon from "../../../../assets/email.svg";
import AgentIcon from "../../../../assets/agent.svg";

import {
  Play,
  Clock,
  Webhook,
  FileText,
  Table,
  Calendar,
  Plug,
  Zap,
} from "lucide-react";

import { TRIGGER_TYPES, TRIGGER_ICON_SRC } from "./constants";
import { INTEGRATION_TYPE } from "../constants/types";

export const TRIGGER_THEMES = {
  [TRIGGER_TYPES.MANUAL]: {
    id: TRIGGER_TYPES.MANUAL,
    name: "Manual Run",
    svgIcon: WorkflowIcon,
    lucideIcon: Play,
    iconUrl: TRIGGER_ICON_SRC[TRIGGER_TYPES.MANUAL],
    hasSvg: true,
    colors: {
      primary: "#1C3693",
      light: "#E8EBF5",
      border: "#B3BCE0",
      text: "#1C3693",
      bg: "#F5F7FC",
      accent: "#2A4BB5",
    },
  },
  [TRIGGER_TYPES.TIME_BASED]: {
    id: TRIGGER_TYPES.TIME_BASED,
    name: "Scheduled Run",
    svgIcon: null,
    lucideIcon: Clock,
    iconUrl: TRIGGER_ICON_SRC[TRIGGER_TYPES.TIME_BASED],
    hasSvg: false,
    colors: {
      primary: "#F59E0B",
      light: "#FEF3C7",
      border: "#FCD34D",
      text: "#92400E",
      bg: "#FFFBEB",
      accent: "#D97706",
    },
  },
  [TRIGGER_TYPES.WEBHOOK]: {
    id: TRIGGER_TYPES.WEBHOOK,
    name: "Incoming Webhook",
    svgIcon: null,
    lucideIcon: Webhook,
    iconUrl: TRIGGER_ICON_SRC[TRIGGER_TYPES.WEBHOOK],
    hasSvg: false,
    colors: {
      primary: "#3B82F6",
      light: "#DBEAFE",
      border: "#93C5FD",
      text: "#1E40AF",
      bg: "#EFF6FF",
      accent: "#2563EB",
    },
  },
  [TRIGGER_TYPES.FORM]: {
    id: TRIGGER_TYPES.FORM,
    name: "Form Submission",
    svgIcon: FormIcon,
    lucideIcon: FileText,
    iconUrl: TRIGGER_ICON_SRC[TRIGGER_TYPES.FORM],
    hasSvg: true,
    colors: {
      primary: "#F59E0B",
      light: "#FEF3C7",
      border: "#FCD34D",
      text: "#92400E",
      bg: "#FFFBEB",
      accent: "#D97706",
    },
  },
  [TRIGGER_TYPES.SHEET]: {
    id: TRIGGER_TYPES.SHEET,
    name: "Spreadsheet Change",
    svgIcon: TableIcon,
    lucideIcon: Table,
    iconUrl: TRIGGER_ICON_SRC[TRIGGER_TYPES.SHEET],
    hasSvg: true,
    colors: {
      primary: "#14B8A6",
      light: "#CCFBF1",
      border: "#5EEAD4",
      text: "#115E59",
      bg: "#F0FDFA",
      accent: "#0D9488",
    },
  },
  [TRIGGER_TYPES.DATE_FIELD]: {
    id: TRIGGER_TYPES.DATE_FIELD,
    name: "Date Field Trigger",
    svgIcon: TableIcon,
    lucideIcon: Calendar,
    iconUrl: TRIGGER_ICON_SRC[TRIGGER_TYPES.DATE_FIELD],
    hasSvg: true,
    colors: {
      primary: "#8B5CF6",
      light: "#EDE9FE",
      border: "#C4B5FD",
      text: "#5B21B6",
      bg: "#F5F3FF",
      accent: "#7C3AED",
    },
  },
  [TRIGGER_TYPES.APP_BASED]: {
    id: TRIGGER_TYPES.APP_BASED,
    name: "App Event",
    svgIcon: AgentIcon,
    lucideIcon: Plug,
    iconUrl: TRIGGER_ICON_SRC[INTEGRATION_TYPE],
    hasSvg: true,
    colors: {
      primary: "#1C3693",
      light: "#E8EBF5",
      border: "#B3BCE0",
      text: "#1C3693",
      bg: "#F5F7FC",
      accent: "#2A4BB5",
    },
  },
};

export const getTriggerTheme = (triggerType) => {
  return TRIGGER_THEMES[triggerType] || {
    id: triggerType,
    name: "Unknown",
    svgIcon: null,
    lucideIcon: Zap,
    hasSvg: false,
    colors: {
      primary: "#6B7280",
      light: "#F3F4F6",
      border: "#D1D5DB",
      text: "#374151",
      bg: "#F9FAFB",
      accent: "#4B5563",
    },
  };
};

export const getTriggerIcon = (triggerType, preferSvg = true) => {
  const theme = getTriggerTheme(triggerType);
  if (preferSvg && theme.iconUrl) {
    return { type: "svg", src: theme.iconUrl };
  }
  if (preferSvg && theme.hasSvg && theme.svgIcon) {
    return { type: "svg", src: theme.svgIcon };
  }
  return { type: "lucide", component: theme.lucideIcon };
};

export const getTriggerColors = (triggerType) => {
  return getTriggerTheme(triggerType).colors;
};

export default TRIGGER_THEMES;
