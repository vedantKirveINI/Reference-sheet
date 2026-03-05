import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TIME_BASED_TRIGGER_V2_TYPE } from "../constants/types";

export { TIME_BASED_TRIGGER_V2_TYPE };

export const TIME_BASED_TRIGGER_V2_NODE = {
  _src: extensionIcons.timeTriggerIcon || "https://cdn-v1.tinycommand.com/1234567890/1742543357097/timebased.svg",
  name: "Time Based Trigger",
  description: "Schedule workflows to run at specific times",
  hoverDescription: "Starts automatically at a scheduled time, triggering workflow execution at that moment.",
  type: TIME_BASED_TRIGGER_V2_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#F59E0B",
  foreground: "#fff",
  dark: "#D97706",
  light: "#F59E0B",
  hasTestModule: false,
  canSkipTest: true,
  denyFromLink: true,
};

export const FREQUENCY_OPTIONS = [
  { id: "minute", label: "Every Minute", description: "Run every minute" },
  { id: "hour", label: "Hourly", description: "Run every hour" },
  { id: "day", label: "Daily", description: "Run every day" },
  { id: "week", label: "Weekly", description: "Run every week" },
  { id: "month", label: "Monthly", description: "Run every month" },
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

export const TIME_TEMPLATES = [
  {
    id: "every-hour",
    name: "Every Hour",
    description: "Run at the start of every hour",
    icon: "Clock",
    defaults: {
      frequency: "hour",
      minute: "0",
      timezone: "UTC",
    },
  },
  {
    id: "daily-morning",
    name: "Daily Morning",
    description: "Run every day at 9:00 AM",
    icon: "Sunrise",
    defaults: {
      frequency: "day",
      hour: "9",
      minute: "0",
      timezone: "UTC",
    },
  },
  {
    id: "weekly-monday",
    name: "Weekly Monday",
    description: "Run every Monday at 9:00 AM",
    icon: "Calendar",
    defaults: {
      frequency: "week",
      dayOfWeek: "monday",
      hour: "9",
      minute: "0",
      timezone: "UTC",
    },
  },
  {
    id: "monthly-first",
    name: "Monthly First",
    description: "Run on the 1st of every month at 9:00 AM",
    icon: "CalendarDays",
    defaults: {
      frequency: "month",
      dayOfMonth: "1",
      hour: "9",
      minute: "0",
      timezone: "UTC",
    },
  },
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
