import React from "react";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import {
  CANVAS_MODE,
  CANVAS_MODES,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import CTAEditor from "../../common-settings/cta-editor";
import { DropdownV2 } from "../../common-settings/dropdown-v2";

interface YesNoSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  viewPort?: ViewPort;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const YesNoSettings = ({
  onChange,
  question,
  viewPort,
  mode,
  disableQuestionAlignment = false,
}: YesNoSettingsProps) => {
  const settings = question?.settings;
  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  const options = ["Yes", "No"];

  return (
    <div className="my-4 grid grid-cols-2 gap-[3.31em]" data-testid="yes-no-general-settings">
      <div className="flex flex-col gap-[3em]">
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          viewPort={viewPort}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        {CANVAS_MODE() === CANVAS_MODES.CMS_CANVAS && (
          <div className="flex flex-col gap-[3em]">
            <SwitchOption
              key="yes-no-enable-map"
              title="Enable Map"
              variant="black"
              checked={settings?.enableMap}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                updateSettings("enableMap", event.target.checked);
              }}
            />
            <SwitchOption
              key="yes-no-is-advanced-field"
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
          key="yes-no-required"
          variant="black"
          title="Required"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("required", event.target.checked);
          }}
          dataTestId="question-settings-required-toggle"
        />
        <CTAEditor />
        {/* <SwitchOption
            key="yes-no-other"
            title="Other"
            checked={settings?.other}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              onChange?.({
                settings: {
                  ...settings,
                  defaultChoice: "None",
                  other: event.target.checked,
                },
              });
            }}
          /> */}

        <SwitchOption
          key="yes-no-vertical"
          variant="black"
          title="Vertical Alignment"
          checked={settings?.vertical}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("vertical", event.target.checked);
          }}
        />
      </div>

      <div className="flex flex-col gap-[3em]">
        <div
          className="w-full flex flex-col items-start gap-4"
          data-testid="settings-default-choice-dropdown"
        >
          <DropdownV2
            variant="black"
            label="Default choice"
            value={settings?.defaultChoice}
            onChange={(value) => {
              updateSettings("defaultChoice", value);
            }}
            options={options}
            isOptionEqualToValue={(option, value) => option === value}
            clearOnEscape
            disableClearable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default YesNoSettings;
