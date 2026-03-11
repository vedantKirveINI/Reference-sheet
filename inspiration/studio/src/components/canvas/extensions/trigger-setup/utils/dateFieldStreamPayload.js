import { TIMING_RULE_TIMING } from "../constants";

const UNIT_TO_MINUTES = {
  minutes: 1,
  hours: 60,
  days: 60 * 24,
  weeks: 60 * 24 * 7,
};

/**
 * Convert offsetValue + offsetUnit to total minutes (for backend triggerConfig).
 */
function toMinutes(offsetValue, offsetUnit) {
  return (offsetValue || 0) * (UNIT_TO_MINUTES[offsetUnit] || 1);
}

/**
 * Converts frontend timing rules + dateField to backend API triggerConfig format.
 * Matches legacy convertStreamPayloadRules (date-field/utils/covert-stream-payload-rules.js).
 * @param {Array} timingRules - Array of { id, timing, offsetValue, offsetUnit, label }
 * @param {Object} dateField - The selected date field object with id (or key)
 * @returns {Array} Array of { name, fieldId, type, offsetMinutes } for upsertStream data.triggerConfig
 */
export function convertStreamPayloadRules(timingRules, dateField) {
  if (!Array.isArray(timingRules)) return [];
  const fieldId = dateField?.id ?? dateField?.key ?? null;
  if (fieldId == null) return [];

  return timingRules.map((rule, index) => {
    const name = rule.label || `Rule ${index + 1}`;
    const type = rule.timing ?? TIMING_RULE_TIMING.BEFORE;
    const offsetMinutes =
      type === TIMING_RULE_TIMING.EXACT
        ? 0
        : toMinutes(rule.offsetValue ?? 1, rule.offsetUnit ?? "minutes");

    return {
      name,
      fieldId,
      type,
      offsetMinutes,
    };
  });
}
