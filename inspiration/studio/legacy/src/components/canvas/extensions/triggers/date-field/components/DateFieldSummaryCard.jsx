import React from "react";
import styles from "./DateFieldSummaryCard.module.css";
import { TIMING_OPTIONS_VALUE, OFFSET_UNITS_VALUE } from "../constants";

const DateFieldSummaryCard = ({ dateField, table, timingRules = [] }) => {
  const getOverallSummary = () => {
    if (!table || !dateField) {
      return "Select a table and date field to configure the trigger";
    }

    if (!timingRules || timingRules.length === 0) {
      return "Add at least one timing rule";
    }

    const tableName = table?.name || "selected table";
    const fieldName = dateField?.name || dateField?.label || "date field";

    if (timingRules.length === 1) {
      return getSingleRuleSummary(timingRules[0], fieldName, tableName);
    }

    return `${timingRules.length} timing rules configured for "${fieldName}" in "${tableName}"`;
  };

  const getSingleRuleSummary = (rule, fieldName, tableName) => {
    const { timing, offsetValue, offsetUnit } = rule;

    const unitLabel =
      offsetUnit === OFFSET_UNITS_VALUE.DAYS && offsetValue === 1
        ? "day"
        : offsetUnit === OFFSET_UNITS_VALUE.HOURS && offsetValue === 1
          ? "hour"
          : offsetUnit === OFFSET_UNITS_VALUE.MINUTES && offsetValue === 1
            ? "minute"
            : offsetUnit === OFFSET_UNITS_VALUE.WEEKS && offsetValue === 1
              ? "week"
              : offsetUnit;

    let timingText;
    if (timing === TIMING_OPTIONS_VALUE.EXACT) {
      timingText = `on the day of`;
    } else if (timing === TIMING_OPTIONS_VALUE.BEFORE) {
      timingText = `${offsetValue} ${unitLabel} before`;
    } else {
      timingText = `${offsetValue} ${unitLabel} after`;
    }

    return `Triggers ${timingText} the "${fieldName}" date in "${tableName}"`;
  };

  const getRuleDescription = (rule, index) => {
    const { timing, offsetValue, offsetUnit, label } = rule;

    const unitLabel =
      offsetUnit === OFFSET_UNITS_VALUE.DAYS && offsetValue === 1
        ? "day"
        : offsetUnit === OFFSET_UNITS_VALUE.HOURS && offsetValue === 1
          ? "hour"
          : offsetUnit === OFFSET_UNITS_VALUE.MINUTES && offsetValue === 1
            ? "minute"
            : offsetUnit === OFFSET_UNITS_VALUE.WEEKS && offsetValue === 1
              ? "week"
              : offsetUnit;

    let timingText;
    if (timing === TIMING_OPTIONS_VALUE.EXACT) {
      timingText = "On the day";
    } else if (timing === TIMING_OPTIONS_VALUE.BEFORE) {
      timingText = `${offsetValue} ${unitLabel} before`;
    } else {
      timingText = `${offsetValue} ${unitLabel} after`;
    }

    const displayLabel = label || `Rule ${index + 1}`;
    return { label: displayLabel, timing: timingText };
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
            <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="12" cy="15" r="2" />
          </svg>
        </div>
        <div className={styles.headerContent}>
          <span className={styles.headerLabel}>Trigger Summary</span>
          <span className={styles.headerText}>{getOverallSummary()}</span>
        </div>
      </div>

      {timingRules.length > 1 && dateField && (
        <div className={styles.rulesList}>
          {timingRules.map((rule, index) => {
            const { label, timing } = getRuleDescription(rule, index);
            return (
              <div key={rule.id} className={styles.ruleItem}>
                <span className={styles.ruleBullet}>{index + 1}</span>
                <span className={styles.ruleLabel}>{label}:</span>
                <span className={styles.ruleTiming}>{timing}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DateFieldSummaryCard;
