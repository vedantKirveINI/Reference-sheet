import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import {
  INTEGRATION_TYPE,
  INPUT_SETUP_TYPE,
  SHEET_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
  TIME_BASED_TRIGGER,
  TRIGGER_SETUP_TYPE,
  WEBHOOK_TYPE,
  FORM_TRIGGER,
} from "../constants/types";

export const TRIGGER_SETUP_NODE = {
  _src: extensionIcons.triggerSetupIcon || "https://cdn-v1.tinycommand.com/1234567890/1749475877233/trigger-setup.svg",
  name: "Trigger Setup",
  hoverDescription: "Configure the entry point for your workflow with modern wizard-style interface.",
  type: TRIGGER_SETUP_TYPE,
  template: NODE_TEMPLATES.TRIGGER_SETUP,
  background: "#6366F1",
  foreground: "#fff",
  dark: "#4F46E5",
  light: "#6366F1",
  hasTestModule: false,
  canSkipTest: false,
  search_keys: [
    "Trigger",
    "Trigger Setup",
    "Start",
    "Manual",
    "Schedule",
    "Webhook",
    "Form",
    "Sheet",
    "Date",
    "App",
    "Integration",
    "Cron",
    "Timer",
    "Event",
  ],
};

export const TRIGGER_SETUP_V3_NODE = TRIGGER_SETUP_NODE;

// Legacy alias for Form Trigger - uses unified trigger-setup with form preset (match legacy saved shape)
export const FORM_TRIGGER_NODE = {
  ...TRIGGER_SETUP_NODE,
  name: "Form Trigger",
  type: FORM_TRIGGER,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1756107470171/Form_trigger.svg",
  subType: "TRIGGER_SETUP",
};

export const THEME = {
  primaryColor: "#4F46E5",
  lightBg: "#EEF2FF",
  primaryButtonBg: "#4F46E5",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(99, 102, 241, 0.08)",
  iconBorder: "rgba(99, 102, 241, 0.15)",
  iconColor: "#6366F1",
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const TRIGGER_TYPES = {
  MANUAL: INPUT_SETUP_TYPE,
  TIME_BASED: TIME_BASED_TRIGGER,
  WEBHOOK: WEBHOOK_TYPE,
  FORM: FORM_TRIGGER,
  SHEET: SHEET_TRIGGER,
  DATE_FIELD: SHEET_DATE_FIELD_TRIGGER,
  APP_BASED: INTEGRATION_TYPE,
};

export const TRIGGER_CATEGORIES = {
  CONNECTED_APPS: {
    id: "connected_apps",
    name: "Connect an App",
    sectionTitle: "CONNECT AN APP",
    description: "When something happens in a connected app",
    order: 1,
    color: "#1C3693",
  },
  TINY_FORMS: {
    id: "tiny_forms",
    name: "Tiny Forms",
    sectionTitle: "TINY FORMS",
    description: "When someone submits your form",
    order: 2,
    color: "#F59E0B",
  },
  SPREADSHEETS: {
    id: "spreadsheets",
    name: "Spreadsheets",
    sectionTitle: "SPREADSHEETS",
    description: "When your data changes",
    order: 3,
    color: "#14B8A6",
  },
  WEBHOOKS: {
    id: "webhooks",
    name: "Webhooks",
    sectionTitle: "WEBHOOKS",
    description: "Receive data from external services",
    order: 4,
    color: "#3B82F6",
  },
  SCHEDULE_MANUAL: {
    id: "schedule_manual",
    name: "Schedule & Manual",
    sectionTitle: "SCHEDULE & MANUAL",
    description: "Run on a schedule or on-demand",
    order: 5,
    color: "#6366F1",
  },
};

/** Legacy form event shape for backend (id/label/info). Used in getData and hydration. */
export const FORM_EVENTS_LEGACY = {
  submit: {
    id: "SUBMITTED",
    label: "Submitted",
    info: "Triggers on successful completion",
  },
};

/** Map legacy event id to internal formEvent value (e.g. for hydration). */
export const FORM_EVENT_ID_TO_KEY = {
  SUBMITTED: "submit",
};

/** Legacy CDN icon URLs for each trigger type (from legacy codebase). */
export const TRIGGER_ICON_SRC = {
  [TRIGGER_TYPES.MANUAL]: "https://cdn-v1.tinycommand.com/1234567890/1742543775187/manual.svg",
  [TRIGGER_TYPES.TIME_BASED]: "https://cdn-v1.tinycommand.com/1234567890/1742543357097/timebased.svg",
  [TRIGGER_TYPES.WEBHOOK]: "https://cdn-v1.tinycommand.com/1234567890/1742543611755/webhook.svg",
  [TRIGGER_TYPES.SHEET]: "https://cdn-v1.tinycommand.com/1234567890/1756107568290/Table_trigger.svg",
  [TRIGGER_TYPES.DATE_FIELD]: "https://cdn-v1.tinycommand.com/1234567890/1756107568290/Table_trigger.svg",
  [TRIGGER_TYPES.FORM]: "https://cdn-v1.tinycommand.com/1234567890/1756107470171/Form_trigger.svg",
  [INTEGRATION_TYPE]: "https://cdn-v1.tinycommand.com/1234567890/1749458455925/app-based-default.svg",
};

export const TRIGGER_TYPE_OPTIONS = [
  {
    id: TRIGGER_TYPES.APP_BASED,
    name: "App Event",
    description: "Listen for events from connected apps like Slack, Stripe, HubSpot",
    icon: "Plug",
    color: "#1C3693",
    category: TRIGGER_CATEGORIES.CONNECTED_APPS.id,
    _src: TRIGGER_ICON_SRC[INTEGRATION_TYPE],
  },
  {
    id: TRIGGER_TYPES.FORM,
    name: "Form Submission",
    description: "When someone submits a form",
    icon: "FileText",
    color: "#F59E0B",
    category: TRIGGER_CATEGORIES.TINY_FORMS.id,
    _src: TRIGGER_ICON_SRC[TRIGGER_TYPES.FORM],
  },
  {
    id: TRIGGER_TYPES.SHEET,
    name: "Spreadsheet Change",
    description: "When a row is added or updated",
    icon: "Table",
    color: "#14B8A6",
    category: TRIGGER_CATEGORIES.SPREADSHEETS.id,
    _src: TRIGGER_ICON_SRC[TRIGGER_TYPES.SHEET],
  },
  {
    id: TRIGGER_TYPES.DATE_FIELD,
    name: "Date Field Trigger",
    description: "Trigger based on a date in your data",
    icon: "Calendar",
    color: "#8B5CF6",
    category: TRIGGER_CATEGORIES.SPREADSHEETS.id,
    _src: TRIGGER_ICON_SRC[TRIGGER_TYPES.DATE_FIELD],
  },
  {
    id: TRIGGER_TYPES.WEBHOOK,
    name: "Incoming Webhook",
    description: "Triggered by external HTTP call",
    icon: "Webhook",
    color: "#3B82F6",
    category: TRIGGER_CATEGORIES.WEBHOOKS.id,
    _src: TRIGGER_ICON_SRC[TRIGGER_TYPES.WEBHOOK],
  },
  {
    id: TRIGGER_TYPES.TIME_BASED,
    name: "Scheduled Run",
    description: "Run on a schedule",
    icon: "Clock",
    color: "#6366F1",
    category: TRIGGER_CATEGORIES.SCHEDULE_MANUAL.id,
    _src: TRIGGER_ICON_SRC[TRIGGER_TYPES.TIME_BASED],
  },
  {
    id: TRIGGER_TYPES.MANUAL,
    name: "Manual Run",
    description: "Start workflow on demand",
    icon: "Play",
    color: "#6366F1",
    category: TRIGGER_CATEGORIES.SCHEDULE_MANUAL.id,
    _src: TRIGGER_ICON_SRC[TRIGGER_TYPES.MANUAL],
  },
];

export const TRIGGER_TEMPLATES = [
  {
    id: "manual_basic",
    name: "Manual Start",
    description: "Simple button to run workflow",
    triggerType: TRIGGER_TYPES.MANUAL,
    icon: "Play",
    defaults: {},
  },
  {
    id: "daily_9am",
    name: "Daily at 9 AM",
    description: "Run every day at 9:00 AM",
    triggerType: TRIGGER_TYPES.TIME_BASED,
    icon: "Clock",
    defaults: {
      frequency: "day",
      hour: "9",
      minute: "0",
      timezone: "UTC",
    },
  },
  {
    id: "webhook_post",
    name: "POST Webhook",
    description: "Receive POST requests from external services",
    triggerType: TRIGGER_TYPES.WEBHOOK,
    icon: "Webhook",
    defaults: {
      method: "POST",
    },
  },
  {
    id: "form_submission",
    name: "Form Submission",
    description: "Start when form is submitted",
    triggerType: TRIGGER_TYPES.FORM,
    icon: "FileText",
    defaults: {},
  },
  {
    id: "sheet_new_row",
    name: "New Sheet Row",
    description: "Trigger when a new row is added",
    triggerType: TRIGGER_TYPES.SHEET,
    icon: "Table",
    defaults: {
      event: "row_created",
    },
  },
  {
    id: "date_reminder",
    name: "Date Reminder",
    description: "Trigger based on date field",
    triggerType: TRIGGER_TYPES.DATE_FIELD,
    icon: "Calendar",
    defaults: {
      offset: 0,
      offsetUnit: "days",
    },
  },
];

export const FREQUENCY_OPTIONS = [
  { id: "minute", label: "Every Minute", description: "Runs every 60 seconds" },
  { id: "hour", label: "Hourly", description: "Runs once per hour" },
  { id: "day", label: "Daily", description: "Runs once per day" },
  { id: "week", label: "Weekly", description: "Runs once per week" },
  { id: "month", label: "Monthly", description: "Runs once per month" },
];

export const DAY_OPTIONS = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export const TIMEZONE_OPTIONS = [
  { id: "UTC", label: "UTC" },
  { id: "America/New_York", label: "Eastern Time (ET)" },
  { id: "America/Chicago", label: "Central Time (CT)" },
  { id: "America/Denver", label: "Mountain Time (MT)" },
  { id: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { id: "Europe/London", label: "London (GMT/BST)" },
  { id: "Europe/Paris", label: "Paris (CET/CEST)" },
  { id: "Asia/Tokyo", label: "Tokyo (JST)" },
  { id: "Asia/Shanghai", label: "Shanghai (CST)" },
  { id: "Asia/Kolkata", label: "India (IST)" },
  { id: "Australia/Sydney", label: "Sydney (AEST)" },
];

export const WEBHOOK_METHOD_OPTIONS = [
  { id: "ANY", label: "Any Method", color: "#6B7280" },
  { id: "GET", label: "GET", color: "#22C55E" },
  { id: "POST", label: "POST", color: "#3B82F6" },
  { id: "PUT", label: "PUT", color: "#F59E0B" },
  { id: "PATCH", label: "PATCH", color: "#EAB308" },
  { id: "DELETE", label: "DELETE", color: "#EF4444" },
];

export const SHEET_EVENT_OPTIONS = [
  { id: "row_created", label: "Row Created", description: "When a new row is added" },
  { id: "row_updated", label: "Row Updated", description: "When an existing row changes" },
  { id: "row_deleted", label: "Row Deleted", description: "When a row is removed" },
];

export const DATE_OFFSET_UNITS = [
  { id: "minutes", label: "Minutes" },
  { id: "hours", label: "Hours" },
  { id: "days", label: "Days" },
  { id: "weeks", label: "Weeks" },
];

/** Timing rule values for date field trigger (legacy-compatible). */
export const TIMING_RULE_TIMING = {
  BEFORE: "BEFORE",
  EXACT: "EXACT",
  AFTER: "AFTER",
};

export const TIMING_RULE_OPTIONS = [
  { value: TIMING_RULE_TIMING.BEFORE, label: "Before" },
  { value: TIMING_RULE_TIMING.EXACT, label: "On the date" },
  { value: TIMING_RULE_TIMING.AFTER, label: "After" },
];

export const TIMING_RULE_OFFSET_UNITS = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
];

/** Create a default timing rule (legacy shape for DATE_FIELD trigger). */
export const createDefaultTimingRule = ({ id = null, index = 0 } = {}) => ({
  id: id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `rule-${index}-${Date.now()}`),
  timing: TIMING_RULE_TIMING.BEFORE,
  offsetValue: 1,
  offsetUnit: "days",
  label: `Rule ${index + 1}`,
});
