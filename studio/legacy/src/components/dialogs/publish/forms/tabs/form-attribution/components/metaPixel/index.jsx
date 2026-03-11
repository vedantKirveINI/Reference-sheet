import React, { forwardRef, useMemo } from "react";
import styles from "./styles.module.css";
// import ODSSwitch from "oute-ds-switch";
// import ODSIcon from "oute-ds-icon";
// import ODSToolTip from "oute-ds-tooltip";
import { ODSSwitch, ODSIcon, ODSTooltip as ODSToolTip } from "@src/module/ods";

const pixelIdPattern = /^\d{15,16}$/;

function MetaPixel({ metaPixelData, setMetaPixelData }, ref) {
  const pixelIdError = useMemo(() => {
    const isEnabled = metaPixelData?.isEnabled || false;
    const pixelId = metaPixelData?.pixelId || "";

    if (!isEnabled) return "";
    if (!pixelId.trim()) return "Pixel ID is required";
    // Meta Pixel ID is typically a 15-16 digit number
    if (!pixelIdPattern.test(pixelId.trim()))
      return "Expected format: 15-16 digit number";
    return "";
  }, [metaPixelData]);

  const handleEnabledChange = (e) => {
    setMetaPixelData({ isEnabled: e.target.checked });
  };

  const handlePixelIdChange = (e) => {
    setMetaPixelData({ pixelId: e.target.value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.toggleContainer}>
          <ODSSwitch
            variant="black"
            labelText="Enable Meta Pixel"
            checked={metaPixelData?.isEnabled || false}
            onChange={handleEnabledChange}
          />
          <ODSToolTip
            title={
              " When enabled, Meta Pixel will track form submissions using the specified Pixel ID."
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

      <div className={styles.form} aria-disabled={!metaPixelData?.isEnabled}>
        <div className={styles.field}>
          <label htmlFor="meta-pixel-id" className={styles.label}>
            Pixel ID
            <ODSToolTip
              title={"Find your Pixel ID in Meta Events Manager"}
              arrow={false}
              placement="right"
            >
              <ODSIcon
                outeIconName={"OUTEInfoIcon"}
                outeIconProps={{
                  sx: {
                    width: "1.5rem",
                    height: "1.5rem",
                    marginTop: "0.25rem",
                  },
                }}
              />
            </ODSToolTip>
          </label>
          <input
            id="meta-pixel-id"
            name="pixelId"
            type="text"
            className={styles.input}
            placeholder="123456789012345"
            value={metaPixelData?.pixelId || ""}
            onChange={handlePixelIdChange}
            disabled={!metaPixelData?.isEnabled}
            aria-invalid={Boolean(pixelIdError)}
            aria-describedby={pixelIdError ? "meta-pixel-id-error" : undefined}
          />
          {pixelIdError ? (
            <div id="meta-pixel-id-error" className={styles.error}>
              {pixelIdError}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default forwardRef(MetaPixel);
