export const SCHEDULE_TYPES = {
  INTERVAL: 'interval',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ONCE: 'once',
  CUSTOM: 'custom',
};

export const SCHEDULE_TYPE_OPTIONS = [
  { 
    id: SCHEDULE_TYPES.INTERVAL, 
    label: 'Interval', 
    description: 'Run at regular intervals',
    icon: '🔄'
  },
  { 
    id: SCHEDULE_TYPES.DAILY, 
    label: 'Daily', 
    description: 'Run every day at a specific time',
    icon: '☀️'
  },
  { 
    id: SCHEDULE_TYPES.WEEKLY, 
    label: 'Weekly', 
    description: 'Run on specific days of the week',
    icon: '📅'
  },
  { 
    id: SCHEDULE_TYPES.MONTHLY, 
    label: 'Monthly', 
    description: 'Run on specific day each month',
    icon: '📆'
  },
  { 
    id: SCHEDULE_TYPES.ONCE, 
    label: 'Once', 
    description: 'Run one time at a specific date/time',
    icon: '⏱️'
  },
  { 
    id: SCHEDULE_TYPES.CUSTOM, 
    label: 'Custom', 
    description: 'Run on specific dates you choose',
    icon: '📌'
  },
];

export const INTERVAL_UNITS = [
  { value: 'minutes', label: 'Minutes', min: 1, max: 59 },
  { value: 'hours', label: 'Hours', min: 1, max: 23 },
];

export const WEEKDAYS = [
  { id: 0, label: 'Sun', fullLabel: 'Sunday' },
  { id: 1, label: 'Mon', fullLabel: 'Monday' },
  { id: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { id: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { id: 4, label: 'Thu', fullLabel: 'Thursday' },
  { id: 5, label: 'Fri', fullLabel: 'Friday' },
  { id: 6, label: 'Sat', fullLabel: 'Saturday' },
];

export const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${getOrdinalSuffix(i + 1)}`,
}));

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-9' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: 'UTC-10' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: 'UTC+0' },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0/+1' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 'UTC+1' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: 'UTC+9' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 'UTC+10' },
  { value: 'Pacific/Auckland', label: 'New Zealand (NZST)', offset: 'UTC+12' },
];

export const DEFAULT_SCHEDULE_CONFIG = {
  scheduleType: SCHEDULE_TYPES.INTERVAL,
  interval: { value: 15, unit: 'minutes' },
  time: '09:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  weekdays: [1, 2, 3, 4, 5],
  dayOfMonth: 1,
  customDates: [],
  onceDate: null,
  advanced: {
    startDate: null,
    endDate: null,
    advancedWeekdays: [0, 1, 2, 3, 4, 5, 6],
  },
};

export const LEGACY_RUN_SCENARIO_MAP = {
  'AT_REGULAR_INTERVALS': SCHEDULE_TYPES.INTERVAL,
  'ONCE': SCHEDULE_TYPES.ONCE,
  'EVERY_DAY': SCHEDULE_TYPES.DAILY,
  'DAYS_OF_THE_WEEK': SCHEDULE_TYPES.WEEKLY,
  'DAYS_OF_THE_MONTH': SCHEDULE_TYPES.MONTHLY,
  'SPECIFIED_DATES': SCHEDULE_TYPES.CUSTOM,
};
