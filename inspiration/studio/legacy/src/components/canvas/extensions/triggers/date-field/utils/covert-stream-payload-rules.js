import { OFFSET_UNITS_VALUE, TIMING_OPTIONS_VALUE } from "../constants";

/**
 * Converts offsetValue and offsetUnit to total minutes
 * @param {number} offsetValue - The offset value
 * @param {string} offsetUnit - The offset unit (minutes, hours, days, weeks)
 * @returns {number} Total minutes
 */
const convertToMinutes = (offsetValue, offsetUnit) => {
  const conversions = {
    [OFFSET_UNITS_VALUE.MINUTES]: 1,
    [OFFSET_UNITS_VALUE.HOURS]: 60,
    [OFFSET_UNITS_VALUE.DAYS]: 60 * 24, // 1440
    [OFFSET_UNITS_VALUE.WEEKS]: 60 * 24 * 7, // 10080
  };
  return offsetValue * (conversions[offsetUnit] || 1);
};

/**
 * Converts frontend timing rules to backend API payload format
 * @param {Array} timingRules - Array of timing rule objects from frontend
 * @param {Object} dateField - The selected date field object with id property
 * @returns {Array} Array of rule objects in backend format
 */
export const convertStreamPayloadRules = (timingRules, dateField) => {
  if (!Array.isArray(timingRules)) {
    return [];
  }

  if (!dateField || !dateField.id) {
    return [];
  }

  return timingRules.map((rule, index) => {
    const name = rule.label || `Rule ${index + 1}`;

    const fieldId = dateField.id;

    const type = rule.timing;

    let offsetMinutes = 0;

    if (type === TIMING_OPTIONS_VALUE.EXACT) {
      offsetMinutes = 0;
    } else {
      const offsetValue = rule.offsetValue || 0;
      const offsetUnit = rule.offsetUnit || OFFSET_UNITS_VALUE.MINUTES;
      offsetMinutes = convertToMinutes(offsetValue, offsetUnit);
    }

    return {
      name,
      fieldId,
      type,
      offsetMinutes,
    };
  });
};
