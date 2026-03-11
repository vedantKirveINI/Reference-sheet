import { useMemo } from "react";

export const useDateFieldSummary = (config) => {
  return useMemo(() => {
    const { table, dateField, timing, offsetValue, offsetUnit } = config || {};

    if (!table || !dateField) {
      return "Select a table and date field to configure the trigger";
    }

    const tableName = table?.name || table?.label || "selected table";
    const fieldName = dateField?.name || dateField?.label || "date field";

    const unitLabel =
      offsetUnit === "days" && offsetValue === 1
        ? "day"
        : offsetUnit === "hours" && offsetValue === 1
          ? "hour"
          : offsetUnit === "minutes" && offsetValue === 1
            ? "minute"
            : offsetUnit === "weeks" && offsetValue === 1
              ? "week"
              : offsetUnit;

    let timingText;
    if (timing === "on") {
      timingText = `on the day of`;
    } else if (timing === "before") {
      timingText = `${offsetValue} ${unitLabel} before`;
    } else {
      timingText = `${offsetValue} ${unitLabel} after`;
    }

    return `Triggers ${timingText} the "${fieldName}" date in "${tableName}"`;
  }, [config]);
};

export default useDateFieldSummary;
