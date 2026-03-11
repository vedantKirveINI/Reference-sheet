import React, { forwardRef, useMemo } from "react";
import styles from "./styles.module.css";
// import ODSSwitch from "oute-ds-switch";
// import ODSToolTip from "oute-ds-tooltip";
// import ODSIcon from "oute-ds-icon";
import { ODSSwitch, ODSTooltip as ODSToolTip, ODSIcon } from "@src/module/ods";

const gtmPattern = /^GTM-[A-Z0-9]+$/i;

function GoogleTagManager({ gtmData, setGtmData }, ref) {
  const containerIdError = useMemo(() => {
    const isEnabled = gtmData?.isEnabled || false;
    const containerId = gtmData?.containerId || "";

    if (!isEnabled) return "";
    if (!containerId.trim()) return "Container ID is required";
    if (!gtmPattern.test(containerId.trim()))
      return "Expected format like GTM-XXXXXXX";
    return "";
  }, [gtmData]);

  const handleEnabledChange = (e) => {
    setGtmData({ isEnabled: e.target.checked });
  };

  const handleContainerIdChange = (e) => {
    setGtmData({ containerId: e.target.value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.toggleContainer}>
          <ODSSwitch
            variant="black"
            labelText="Enable Google Tag Manager"
            checked={gtmData?.isEnabled || false}
            onChange={handleEnabledChange}
          />
          <ODSToolTip
            title={
              "When enabled, the GTM snippet will use your Container ID to send events"
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

      <div className={styles.form} aria-disabled={!gtmData?.isEnabled}>
        <div className={styles.field}>
          <label htmlFor="gtm-container-id" className={styles.label}>
            Container ID
          </label>
          <input
            id="gtm-container-id"
            name="containerId"
            type="text"
            className={styles.input}
            placeholder="GTM-XXXXXXX"
            value={gtmData?.containerId || ""}
            onChange={handleContainerIdChange}
            disabled={!gtmData?.isEnabled}
            aria-invalid={Boolean(containerIdError)}
            aria-describedby={
              containerIdError ? "gtm-container-id-error" : undefined
            }
          />
          {containerIdError ? (
            <div id="gtm-container-id-error" className={styles.error}>
              {containerIdError}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default forwardRef(GoogleTagManager);
