import React from "react";
import { ODSLabel } from "@src/module/ods";
import { ODSTextField } from "@src/module/ods";
import { styles } from "./styles";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";

const LoadingSettings = ({ onChange, question, mode }) => {
  const settings = question?.settings;
  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div style={styles.container} data-testid="loading-general-settings">
      <div
        style={styles.inputContainer}
        data-testid="settings-min-loading-time-input-container"
      >
        <ODSLabel variant="body1">Min Loading Time (in sec)</ODSLabel>
        <ODSTextField
          value={settings?.minLoadingTime || ""}
          placeholder="Enter time"
          onChange={(e) => {
            if (!REGEX_CONSTANTS.NUMBER_REGEX.test(e.target.value)) return;
            updateSettings("minLoadingTime", e.target.value);
          }}
          
          inputProps={{
            sx: styles.getInputStyle(),
            "data-testid": "settings-min-loading-time-input",
          }}
        />
      </div>
    </div>
  );
};

export default LoadingSettings;
