/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import React from "react";
import {
  CANVAS_MODE,
  CANVAS_MODES,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import SwitchOption from "../../common-settings/switch";
import { styles } from "./styles";

interface KeyValueTableSettingsProps {
  viewPort?: ViewPort;
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
}

const KeyValueTableSettings = ({
  onChange,
  question,
}: KeyValueTableSettingsProps) => {
  const settings = question?.settings;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };
  return (
    <div css={styles.container} data-testid="key-value-table-general-settings">
      <div css={styles.wrapperContainer}>
        {CANVAS_MODE() === CANVAS_MODES.CMS_CANVAS && (
          <div css={styles.wrapperContainer}>
            <SwitchOption
              key="key-value-enable-map"
              title="Enable Map"
              variant="black"
              checked={settings?.enableMap}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                updateSettings("enableMap", event.target.checked);
              }}
            />
            <SwitchOption
              key="key-value-is-advanced-field"
              title="Show only in Advanced Settings"
              variant="black"
              checked={settings?.isAdvancedField}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                updateSettings("isAdvancedField", event.target.checked);
              }}
            />
          </div>
        )}
        <SwitchOption
          key="key-value-table-default-value"
          variant="black"
          title="Default Value"
          checked={settings?.withDefaultValue}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("withDefaultValue", event.target.checked);
          }}
        />
        <SwitchOption
          key="key-value-table-default"
          variant="black"
          title="Allow Add Row"
          checked={settings?.allowAddRow}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("allowAddRow", event.target.checked);
          }}
        />
      </div>
    </div>
  );
};

export default KeyValueTableSettings;
