/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import React from "react";
import QuestionAlignment from "../../common-settings/alignment";
import SwitchOption from "../../common-settings/switch";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";
import { DropdownV2 } from "../../common-settings/dropdown-v2";

const OPINION_SCALE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface OpinionScaleSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  disableQuestionAlignment: boolean;
}

const OpinionScaleGeneralSettings = ({
  onChange,
  question,
  mode,
  disableQuestionAlignment,
}: OpinionScaleSettingsProps) => {
  const settings = question?.settings;
  const maxValue = settings?.maxValue;
  const defaultValue = settings?.defaultValue;
  console.log(settings, "settings");

  const filteredMaxRating = OPINION_SCALE_OPTIONS.filter(
    (option) => Number(option) <= maxValue
  );

  const updateSettings = (key: string, value: any) => {
    let updatedSettings = { ...settings, [key]: value };

    if (key === "maxValue") {
      const newMax = value;
      const currentDefault = settings?.defaultValue;

      if (currentDefault >= newMax) {
        updatedSettings.defaultValue = newMax;
      }
    }

    onChange?.({ settings: updatedSettings });
  };

  return (
    <>
      <div css={styles.container} data-testid="opinion-scale-general-settings">
        <div css={styles.wrapperContainer}>
          <QuestionAlignment
            settings={settings}
            onChange={updateSettings}
            style={{ width: "100%" }}
            mode={mode}
            disabled={disableQuestionAlignment}
          />
          <SwitchOption
            key="required-required"
            variant="black"
            title="Required"
            styles={{ width: "100%" }}
            checked={settings?.required}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              updateSettings("required", event.target.checked)
            }
            dataTestId="question-settings-required-toggle"
          />
          <CTAEditor />
        </div>

        <div css={styles.wrapperContainer}>
          <DropdownV2
            label="Default Value"
            variant="black"
            value={defaultValue}
            options={filteredMaxRating}
            onChange={(value) => {
              updateSettings("defaultValue", value);
            }}
            isOptionEqualToValue={(option, value) => {
              return option === value;
            }}
            getOptionLabel={(option) => option.toString()}
            selecOnFocus={false}
            placeholder="Select value"
            dataTestId="default-value"
            clearOnEscape
            disableClearable={false}
          />

          <DropdownV2
            label="Max Value"
            variant="black"
            value={maxValue}
            options={OPINION_SCALE_OPTIONS}
            onChange={(value) => {
              updateSettings("maxValue", Number(value));
            }}
            getOptionLabel={(option) => option.toString()}
            defaultValue={Number(maxValue)}
            isOptionEqualToValue={(option, value) => {
              return option === value;
            }}
            selecOnFocus={false}
            placeholder="Select value"
            dataTestId="max-value"
          />
        </div>
      </div>
    </>
  );
};

export default OpinionScaleGeneralSettings;
