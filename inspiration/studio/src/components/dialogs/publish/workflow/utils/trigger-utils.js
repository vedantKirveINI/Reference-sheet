import {
  WEBHOOK_TYPE,
  TIME_BASED_TRIGGER,
  INPUT_SETUP_TYPE,
  HTTP_TYPE,
  INTEGRATION_TYPE,
  TRANSFORMER_TYPE,
  SHEET_TRIGGER,
  FORM_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
} from "../../../../canvas/extensions";
import dayjs from "dayjs";

// TRIGGER_SETUP_TYPE is not exported from extensions, hardcode it
const TRIGGER_SETUP_TYPE = "TRIGGER_SETUP";

/**
 * Extract trigger nodes from the nodes array
 * @param {Array} nodes - Array of workflow nodes
 * @returns {Array} Array of trigger nodes
 */

export const extractTriggerNodes = (nodes = []) => {
  if (!Array.isArray(nodes)) return [];

  const filtered = nodes.filter((node) => {
    const nodeType = node?.type || node?.data?.type;
    const nodeSubType = node?.subType || node?.data?.subType;

    if (
      [
        WEBHOOK_TYPE,
        TIME_BASED_TRIGGER,
        SHEET_TRIGGER,
        FORM_TRIGGER,
        INPUT_SETUP_TYPE,
        SHEET_DATE_FIELD_TRIGGER,
      ].includes(nodeType)
    ) {
      return true;
    }

    // if a integration node has a TRIGGER_SETUP subType, it is a app-based trigger
    if (nodeType === INTEGRATION_TYPE && nodeSubType === TRIGGER_SETUP_TYPE) {
      return true;
    }

    return false;
  });
  return filtered;
};

/**
 * Format time-based trigger description in English
 * @param {Object} goData - Trigger node goData
 * @returns {String} Formatted description
 */
export const formatTimeBasedTriggerDescription = (goData = {}) => {
  const { runScenario, minutes, startDate, endDate } = goData;

  if (!runScenario && !minutes) {
    return "Time-based trigger configured";
  }

  let description = "";

  // Handle run scenario
  if (runScenario) {
    switch (runScenario) {
      case "every_minutes":
      case "AT_REGULAR_INTERVALS":
        description = `Runs every ${minutes || 15} minute${
          minutes !== 1 ? "s" : ""
        }`;
        break;
      case "daily":
      case "EVERY_DAY":
        description = "Runs daily";
        if (startDate) {
          const time = dayjs(startDate);
          description += ` at ${time.format("h:mm A")}`;
        }
        break;
      case "weekly":
      case "DAYS_OF_THE_WEEK":
        description = "Runs weekly";
        if (startDate) {
          const date = dayjs(startDate);
          description += ` on ${date.format("dddd")}`;
          if (startDate) {
            const time = dayjs(startDate);
            description += ` at ${time.format("h:mm A")}`;
          }
        }
        break;
      case "monthly":
      case "DAYS_OF_THE_MONTH":
        description = "Runs monthly";
        if (startDate) {
          const date = dayjs(startDate);
          description += ` on the ${date.format("Do")}`;
          if (startDate) {
            const time = dayjs(startDate);
            description += ` at ${time.format("h:mm A")}`;
          }
        }
        break;
      default:
        description = `Runs every ${minutes || 15} minute${
          minutes !== 1 ? "s" : ""
        }`;
    }
  } else if (minutes) {
    description = `Runs every ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  // Add date range if specified
  if (startDate && endDate) {
    const start = dayjs(startDate).format("MMM D, YYYY");
    const end = dayjs(endDate).format("MMM D, YYYY");
    description += ` (from ${start} to ${end})`;
  } else if (startDate) {
    const start = dayjs(startDate).format("MMM D, YYYY");
    description += ` (starting ${start})`;
  } else if (endDate) {
    const end = dayjs(endDate).format("MMM D, YYYY");
    description += ` (until ${end})`;
  }

  return description || "Time-based trigger configured";
};

/**
 * Format sheet trigger description in English
 * @param {Object} goData - Trigger node goData
 * @returns {String} Formatted description
 */
export const formatSheetTriggerDescription = (goData = {}) => {
  const { asset, subSheet, eventType } = goData;

  if (!asset || !subSheet) {
    return "Sheet trigger configured";
  }

  const sheetName = asset?.name || "Sheet";
  const tableName = subSheet?.name || "Table";

  let eventDescription = "";
  if (Array.isArray(eventType) && eventType.length > 0) {
    const events = eventType.map((event) => {
      switch (event) {
        case "Create Record":
          return "created";
        case "Update Record":
          return "updated";
        case "Delete Record":
          return "deleted";
        default:
          return event.toLowerCase();
      }
    });

    const formatter = new Intl.ListFormat("en", {
      style: "long",
      type: "conjunction",
    });

    eventDescription = formatter.format(events);
  } else {
    eventDescription = "modified";
  }

  return `Triggers when records are ${eventDescription} in '${sheetName} > ${tableName}'`;
};

/**
 * Format form trigger description in English
 * @param {Object} goData - Trigger node goData
 * @returns {String} Formatted description
 */
export const formatFormTriggerDescription = (goData = {}) => {
  const { form, event } = goData;

  if (!form) {
    return "Form trigger configured";
  }

  const formName = form?.name || "Form";
  let eventDescription = "submitted";

  if (event?.id) {
    switch (event.id) {
      case "SUBMITTED":
        eventDescription = "submitted";
        break;
      case "FORM_STARTED":
        eventDescription = "started";
        break;
      case "FORM_ABANDONED":
        eventDescription = "abandoned";
        break;
      default:
        eventDescription = (event.id ?? "").toLowerCase().replace("_", " ");
    }
  }

  return `Triggers when '${formName}' is ${eventDescription}`;
};

/**
 * Format sheet date-time (date field) trigger description in English
 * @param {Object} goData - Trigger node goData (asset, subSheet, dateField, timingRules)
 * @returns {String} Formatted description
 */
export const formatSheetDateFieldTriggerDescription = (goData = {}) => {
  const { asset, subSheet, dateField, timingRules } = goData;

  if (!asset || !subSheet || !dateField) {
    return "Date field trigger configured";
  }

  const sheetName = asset?.name || asset?.title || "Sheet";
  const tableName = subSheet?.name || subSheet?.title || "Table";
  const columnName =
    (typeof dateField === "object" && (dateField?.name ?? dateField?.label)) ||
    "date column";

  const rule = Array.isArray(timingRules) && timingRules.length > 0 ? timingRules[0] : null;
  let timingText = "reaches the date";
  if (rule) {
    const value = rule.offsetValue ?? 1;
    const unit = (rule.offsetUnit || "days").replace(/s$/, "");
    const unitLabel = value === 1 ? unit : `${unit}s`;
    switch (rule.timing) {
      case "BEFORE":
        timingText = `is ${value} ${unitLabel} before the date`;
        break;
      case "AFTER":
        timingText = `is ${value} ${unitLabel} after the date`;
        break;
      case "EXACT":
        timingText = "reaches the date";
        break;
      default:
        timingText = `is ${value} ${unitLabel} before the date`;
    }
  }

  return `a date in '${sheetName} > ${tableName}' column '${columnName}' ${timingText}`;
};

/**
 * Get node summary counts by type
 * @param {Array} nodes - Array of workflow nodes
 * @returns {Object} Object with node type counts
 */
export const getNodeSummary = (nodes = []) => {
  if (!Array.isArray(nodes)) {
    return {
      http: 0,
      integration: 0,
      transformer: 0,
      total: 0,
    };
  }

  const summary = {
    http: 0,
    integration: 0,
    transformer: 0,
    total: nodes.length,
  };

  nodes.forEach((node) => {
    const nodeType = node?.type || node?.data?.type;
    if (nodeType === HTTP_TYPE) {
      summary.http++;
    } else if (nodeType === INTEGRATION_TYPE) {
      summary.integration++;
    } else if (nodeType === TRANSFORMER_TYPE) {
      summary.transformer++;
    }
  });

  return summary;
};
