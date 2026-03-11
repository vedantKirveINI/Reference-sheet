import React, { ChangeEvent } from "react";
import { styles } from "./styles";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import CTAEditor from "../../common-settings/cta-editor";
import { ODSLabel } from "@src/module/ods";
import { DropdownV2 } from "../../common-settings/dropdown-v2";
const SliderGeneralSettings = ({
  question,
  onChange,
  mode,
  disableQuestionAlignment,
}: any) => {
  const settings = question?.settings;
  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div style={styles.container} data-testid="slider-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          key="slider-required"
          title="Required"
          checked={settings?.required}
          variant="black"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            updateSettings("required", event.target.checked);
          }}
        />
        <CTAEditor />
      </div>

      <div style={styles.wrapperContainer}>
        <div style={styles.wrapper}>
          <ODSLabel variant="body1">Select Range</ODSLabel>
          <div style={styles.selectContainer}>
            <DropdownV2
              variant="black"
              options={[0, 1]}
              value={settings?.minValue}
              onChange={(newValue) => {
                const newMin = Number(newValue);
                updateSettings("minValue", newMin);
              }}
              getOptionLabel={(option) => String(option)}
              isOptionEqualToValue={(option, value) => option === value}
              data-testid="slider-min-value-dropdown"
            />

            <DropdownV2
              variant="black"
              options={[5, 6, 7, 8, 9, 10]}
              value={settings?.maxValue}
              onChange={(newValue) => {
                const newMax = Number(newValue);
                updateSettings("maxValue", newMax);
              }}
              getOptionLabel={(option) => String(option)}
              isOptionEqualToValue={(option, value) => option === value}
              data-testid="slider-max-value-dropdown"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderGeneralSettings;
