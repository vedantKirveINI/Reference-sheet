import { SEQUENCE_NODE_TYPES } from "../../constants";

export const MERGE_JOIN_NODE_TYPE = SEQUENCE_NODE_TYPES.MERGE_JOIN;

export const THEME = {
  primaryButtonBg: "#37474F",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(96, 125, 139, 0.08)",
  iconBorder: "rgba(96, 125, 139, 0.15)",
  iconColor: "#607D8B",
};

export const MERGE_TYPES = [
  {
    id: "wait_for_all",
    label: "Wait for All",
    description: "Wait until all incoming branches complete before continuing",
    icon: "Users",
  },
  {
    id: "first_wins",
    label: "First Wins",
    description: "Continue as soon as any branch completes (cancel others)",
    icon: "Zap",
  },
];
