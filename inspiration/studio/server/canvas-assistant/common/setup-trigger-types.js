/**
 * Trigger node type configs - valid triggers for workflow generation.
 * Excludes placeholders (TRIGGER_SETUP_V3). Reference: .context/canvas.json (read-only).
 */

export const SETUP_TRIGGER_TYPES = {
  FORM_TRIGGER: {
    shortDescription: "Form submission trigger",
    configSchema: "Optional config for form reference",
  },
  CUSTOM_WEBHOOK: {
    shortDescription: "Webhook trigger (external API calls your URL)",
    configSchema: "method (string: POST, GET, etc., optional), path (optional)",
  },
  TIME_BASED_TRIGGER_V2: {
    shortDescription: "Schedule trigger (cron/interval). **Required config** for schedule: scheduleType, time, optionally timezone.",
    configSchema: "scheduleType (interval|daily|weekly|monthly|once|custom), time (HH:mm, e.g. 12:00), timezone (IANA, optional), interval (object with value, unit for interval type when scheduleType is interval)",
  },
  SHEET_TRIGGER_V2: {
    shortDescription: "Sheet record change trigger",
    configSchema: "sheetEvent (row_created, row_updated, etc., optional)",
  },
  SHEET_DATE_FIELD_TRIGGER: {
    shortDescription: "Date reminder (trigger from date column in sheet)",
    configSchema: "Optional config",
  },
};
