import React, { forwardRef, useMemo } from "react";
import styles from "./styles.module.css";
// import ODSSwitch from "oute-ds-switch";
// import ODSToolTip from "oute-ds-tooltip";
// import ODSIcon from "oute-ds-icon";
import { ODSSwitch, ODSTooltip as ODSToolTip, ODSIcon } from "@src/module/ods";

const ga4Pattern = /^G-[A-Z0-9]+$/i;
const uaPattern = /^UA-\d{4,10}-\d{1,4}$/i;

function GoogleAnalytics({ gaData, setGaData }, ref) {
  const measurementIdError = useMemo(() => {
    const isEnabled = gaData?.isEnabled || false;
    const measurementId = gaData?.measurementId || "";

    if (!isEnabled) return "";
    if (!measurementId.trim()) return "Measurement ID is required";
    // GA4 format: G-XXXXXXXXXX or Universal Analytics: UA-XXXXXX-XX

    if (
      !ga4Pattern.test(measurementId.trim()) &&
      !uaPattern.test(measurementId.trim())
    ) {
      return "Expected format: G-XXXXXXXXXX (GA4) or UA-XXXXXX-XX (Universal)";
    }
    return "";
  }, [gaData]);

  const handleEnabledChange = (e) => {
    setGaData({ isEnabled: e.target.checked });
  };

  const handleMeasurementIdChange = (e) => {
    setGaData({ measurementId: e.target.value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.toggleContainer}>
          <ODSSwitch
            variant="black"
            labelText="Enable Google Analytics"
            checked={gaData?.isEnabled || false}
            onChange={handleEnabledChange}
          />
          <ODSToolTip
            title={
              "When enabled, Google Analytics will send events to the specified Measurement ID."
            }
            arrow={false}
            placement="bottom"
          >
            <ODSIcon
              outeIconName={"OUTEInfoIcon"}
              outeIconProps={{
                sx: { width: "1.5rem", height: "1.5rem", marginTop: "0.25rem" },
              }}
            />
          </ODSToolTip>
        </div>
      </div>

      <div className={styles.form} aria-disabled={!gaData?.isEnabled}>
        <div className={styles.field}>
          <label htmlFor="ga-measurement-id" className={styles.label}>
            Measurement ID
          </label>
          <input
            id="ga-measurement-id"
            name="measurementId"
            type="text"
            className={styles.input}
            placeholder="G-XXXXXXXXXX or UA-XXXXXX-XX"
            value={gaData?.measurementId || ""}
            onChange={handleMeasurementIdChange}
            disabled={!gaData?.isEnabled}
            aria-invalid={Boolean(measurementIdError)}
            aria-describedby={
              measurementIdError ? "ga-measurement-id-error" : undefined
            }
          />
          {measurementIdError ? (
            <div id="ga-measurement-id-error" className={styles.error}>
              {measurementIdError}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default forwardRef(GoogleAnalytics);
