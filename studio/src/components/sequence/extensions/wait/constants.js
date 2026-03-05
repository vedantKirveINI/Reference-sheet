import { SEQUENCE_NODE_TYPES } from "../../constants";

export const WAIT_NODE_TYPE = SEQUENCE_NODE_TYPES.WAIT;

export const THEME = {
  primaryButtonBg: "#0891B2",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(6, 182, 212, 0.08)",
  iconBorder: "rgba(6, 182, 212, 0.15)",
  iconColor: "#06B6D4",
};

export const WAIT_TYPES = {
  DURATION: "duration",
  UNTIL: "until",
  UNTIL_BEFORE: "until_before",
};

export const DURATION_UNITS = {
  HOURS: { id: "hours", label: "Hours", singular: "hour" },
  DAYS: { id: "days", label: "Days", singular: "day" },
  WEEKS: { id: "weeks", label: "Weeks", singular: "week" },
};

export const DEFAULT_WAIT_STATE = {
  name: "Wait",
  waitType: WAIT_TYPES.DURATION,
  durationValue: 1,
  durationUnit: DURATION_UNITS.DAYS.id,
  untilDate: null,
  untilTime: null,
  beforeValue: 1,
  beforeUnit: DURATION_UNITS.DAYS.id,
  referenceDate: "",
  excludeWeekends: false,
};
