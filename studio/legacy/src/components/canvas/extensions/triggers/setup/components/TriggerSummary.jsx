import React from "react";
import { ODSIcon as Icon } from "@src/module/ods";
import {
  SHEET_TRIGGER,
  TIME_BASED_TRIGGER,
  WEBHOOK_TYPE,
  FORM_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
} from "../../../constants/types";
import styles from "./TriggerSummary.module.css";

const SummaryRow = ({ label, value, isNull = false }) => (
  <div className={styles.summaryRow}>
    <span className={styles.summaryLabel}>{label}</span>
    <span
      className={`${styles.summaryValue} ${isNull ? styles.nullValue : ""}`}
    >
      {value}
    </span>
  </div>
);

const TriggerSummary = ({ triggerType, configureData = {} }) => {
  const renderTableTriggerSummary = () => {
    const tableName = configureData?.table?.name;
    const eventType = configureData?.event?.name;
    const hasCondition = configureData?.condition?.rules?.length > 0;

    return (
      <>
        <SummaryRow
          label="Table"
          value={tableName || "Not selected"}
          isNull={!tableName}
        />
        <SummaryRow
          label="Event"
          value={eventType || "Not selected"}
          isNull={!eventType}
        />
        <SummaryRow
          label="Condition"
          value={hasCondition ? "Configured" : "None"}
          isNull={!hasCondition}
        />
      </>
    );
  };

  const renderTimeBasedSummary = () => {
    const schedule = configureData?.schedule;
    const scheduleType = schedule?.type;

    const getScheduleDescription = () => {
      if (!scheduleType) return null;

      switch (scheduleType) {
        case "interval":
          const interval = schedule?.interval?.value;
          const unit = schedule?.interval?.unit;
          return `Every ${interval} ${unit}`;
        case "daily":
          const time = schedule?.daily?.time;
          return time ? `Daily at ${time}` : "Daily";
        case "weekly":
          const days = schedule?.weekly?.days?.join(", ");
          return days ? `Weekly on ${days}` : "Weekly";
        case "monthly":
          return "Monthly";
        case "once":
          return "Run once";
        case "custom":
          return "Custom schedule";
        default:
          return scheduleType;
      }
    };

    const description = getScheduleDescription();

    return (
      <>
        <SummaryRow
          label="Schedule"
          value={description || "Not configured"}
          isNull={!description}
        />
        <SummaryRow
          label="Timezone"
          value={schedule?.timezone || "Default"}
          isNull={!schedule?.timezone}
        />
        <SummaryRow
          label="Status"
          value={schedule?.enabled !== false ? "Active" : "Paused"}
          isNull={false}
        />
      </>
    );
  };

  const renderWebhookSummary = () => {
    const webhookUrl = configureData?.webhookUrl;

    return (
      <>
        <SummaryRow
          label="Webhook URL"
          value={webhookUrl ? "Generated" : "Pending"}
          isNull={!webhookUrl}
        />
        <SummaryRow label="Method" value="POST" isNull={false} />
      </>
    );
  };

  const renderFormTriggerSummary = () => {
    const formName = configureData?.form?.name;

    return (
      <>
        <SummaryRow
          label="Form"
          value={formName || "Not selected"}
          isNull={!formName}
        />
      </>
    );
  };

  const renderDateFieldSummary = () => {
    const tableName = configureData?.table?.name;
    const dateField = configureData?.dateField?.name;
    const rulesCount = configureData?.rules?.length || 0;

    return (
      <>
        <SummaryRow
          label="Table"
          value={tableName || "Not selected"}
          isNull={!tableName}
        />
        <SummaryRow
          label="Date Field"
          value={dateField || "Not selected"}
          isNull={!dateField}
        />
        <SummaryRow
          label="Rules"
          value={
            rulesCount > 0
              ? `${rulesCount} rule${rulesCount > 1 ? "s" : ""}`
              : "None"
          }
          isNull={rulesCount === 0}
        />
      </>
    );
  };

  const renderSummaryContent = () => {
    switch (triggerType) {
      case SHEET_TRIGGER:
        return renderTableTriggerSummary();
      case TIME_BASED_TRIGGER:
        return renderTimeBasedSummary();
      case WEBHOOK_TYPE:
        return renderWebhookSummary();
      case FORM_TRIGGER:
        return renderFormTriggerSummary();
      case SHEET_DATE_FIELD_TRIGGER:
        return renderDateFieldSummary();
      default:
        return null;
    }
  };

  const content = renderSummaryContent();
  if (!content) return null;

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryHeader}>
        <Icon
          outeIconName="OUTESettingsIcon"
          sx={{ fontSize: "1rem", color: "#607d8b" }}
        />
        <span className={styles.summaryTitle}>Configuration Summary</span>
      </div>
      <div className={styles.summaryContent}>{content}</div>
    </div>
  );
};

export default TriggerSummary;
