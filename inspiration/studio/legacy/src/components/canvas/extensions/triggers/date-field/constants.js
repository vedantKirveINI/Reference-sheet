export const TIMING_OPTIONS_VALUE = {
  BEFORE: "BEFORE",
  EXACT: "EXACT",
  AFTER: "AFTER",
};

export const TIMING_OPTIONS = [
  { value: TIMING_OPTIONS_VALUE.BEFORE, label: "Before" },
  { value: TIMING_OPTIONS_VALUE.EXACT, label: "On the date" },
  { value: TIMING_OPTIONS_VALUE.AFTER, label: "After" },
];

export const OFFSET_UNITS_VALUE = {
  MINUTES: "minutes",
  HOURS: "hours",
  DAYS: "days",
  WEEKS: "weeks",
};

export const OFFSET_UNITS = [
  { value: OFFSET_UNITS_VALUE.MINUTES, label: "Minutes" },
  { value: OFFSET_UNITS_VALUE.HOURS, label: "Hours" },
  { value: OFFSET_UNITS_VALUE.DAYS, label: "Days" },
  { value: OFFSET_UNITS_VALUE.WEEKS, label: "Weeks" },
];

export const DATE_FIELD_TYPES = [
  "date",
  "datetime",
  "timestamp",
  "Date",
  "DateTime",
];

export const createDefaultTimingRule = ({ id = null, index = 0 }) => ({
  id: id || crypto.randomUUID(),
  timing: TIMING_OPTIONS_VALUE.BEFORE,
  offsetValue: 1,
  offsetUnit: OFFSET_UNITS_VALUE.MINUTES,
  label: `Rule ${index + 1}`,
});
