import { SEQUENCE_NODE_TYPES } from "../../constants";

export const LOOP_START_NODE_TYPE = SEQUENCE_NODE_TYPES.LOOP_START;
export const LOOP_END_NODE_TYPE = SEQUENCE_NODE_TYPES.LOOP_END;

export const THEME = {
  primaryButtonBg: "#E65100",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(255, 152, 0, 0.08)",
  iconBorder: "rgba(255, 152, 0, 0.15)",
  iconColor: "#FF9800",
};

export const LOOP_TYPES = {
  COUNT: "count",
  CONDITION: "condition",
  INDEFINITE: "indefinite",
};

export const INTERVAL_UNITS = {
  HOURS: { id: "hours", label: "Hours", singular: "hour" },
  DAYS: { id: "days", label: "Days", singular: "day" },
  WEEKS: { id: "weeks", label: "Weeks", singular: "week" },
};

export const DEFAULT_LOOP_STATE = {
  name: "Loop",
  loopType: LOOP_TYPES.COUNT,
  iterationCount: 5,
  conditionField: "",
  conditionOperator: "equals",
  conditionValue: "",
  intervalValue: 1,
  intervalUnit: INTERVAL_UNITS.DAYS.id,
  excludeWeekends: false,
  maxIterations: 100,
  pairedNodeId: null,
  timeoutValue: null,
  timeoutUnit: INTERVAL_UNITS.HOURS.id,
  breakConditionField: "",
  breakConditionOperator: "equals",
  breakConditionValue: "",
  containerColorId: "orange",
  containerNote: "",
  usePathFollowing: false,
};

export const CONDITION_OPERATORS = [
  { id: "equals", label: "Equals" },
  { id: "not_equals", label: "Not equals" },
  { id: "is_true", label: "Is true" },
  { id: "is_false", label: "Is false" },
  { id: "exists", label: "Has value" },
  { id: "not_exists", label: "Is empty" },
];
