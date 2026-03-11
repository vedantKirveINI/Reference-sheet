/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import React from "react";
import { ODSLabel } from "@src/module/ods";
import { ViewPort } from "@oute/oute-ds.core.constants";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";
import { DropdownV2 } from "../../common-settings/dropdown-v2";

interface SCQSettingsProps {
  viewPort?: ViewPort;
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const OTHER_OPTION_VALUE = "Other";

const SCQSettings = ({
  onChange = (val: any) => {},
  question,
  viewPort,
  mode,
  disableQuestionAlignment,
}: SCQSettingsProps) => {
  const settings = question?.settings;
  const defaultValueError = settings?.errors?.defaultValueError;

  const sanitizedQuestionOptions = question?.options?.filter((opt) =>
    opt?.trim(),
  );
  const questionOptions = settings?.other
    ? [...sanitizedQuestionOptions, OTHER_OPTION_VALUE]
    : sanitizedQuestionOptions;

  const updateScqOptions = (value) => {
    onChange({
      settings: {
        ...settings,
        other: value,
      },
    });
  };

  const updateSettings = (
    key: string,
    value: any,
    errors?: Record<string, string>,
  ) => {
    onChange?.({
      settings: {
        ...settings,
        [key]: value,
        errors: { ...settings?.errors, ...errors },
      },
    });
  };

  const initialDefaultValues = settings?.defaultValue;

  return (
    <div css={styles.container} data-testid="scq-general-settings">
      <div css={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />

        <SwitchOption
          key="mcq-required"
          variant="black"
          title="Required"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("required", event.target.checked);
          }}
          dataTestId="question-settings-required-toggle"
        />
        <CTAEditor />

        <SwitchOption
          key="mcq-randomize"
          variant="black"
          title="Randomize"
          checked={settings?.randomize}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("randomize", event.target.checked);
          }}
        />

        <SwitchOption
          key="mcq-vertical-alignment"
          variant="black"
          title="Arrange Options Vertically"
          checked={settings?.isAlignmentVertical}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("isAlignmentVertical", event.target.checked);
          }}
        />

        <SwitchOption
          key="mcq-other"
          variant="black"
          title="Include Other"
          styles={{ width: "100%" }}
          checked={settings?.other}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateScqOptions(event.target.checked);
          }}
          dataTestId="settings-other-option-switch"
        />
        {settings?.other && (
          <SwitchOption
            key="scq-allowOtherInput"
            variant="black"
            title="Allow other input"
            styles={{ width: "100%" }}
            disabled={!settings?.other}
            checked={settings?.allowOtherInput}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              updateSettings("allowOtherInput", event.target.checked);
            }}
            dataTestId="settings-allow-other-input-switch"
          />
        )}
      </div>

      <div css={styles.wrapperContainer}>
        <div
          css={styles.autocompleteContainer}
          data-testid="scq-default-value-dropdown"
        >
          <ODSLabel variant="body1">Default Value</ODSLabel>

          <DropdownV2
            variant="black"
            searchable={true}
            multiple={false}
            clearOnEscape
            disableClearable={false}
            // option.trim and filter because we want to remove all options that are either empty or have spaces
            options={questionOptions?.filter((option) => option?.trim())}
            value={initialDefaultValues}
            onChange={(value) => {
              updateSettings("defaultValue", value, { defaultValueError: "" });
            }}
            isOptionEqualToValue={(option, value) => {
              return option?.toLowerCase() === value?.toLowerCase();
            }}
          />
          {defaultValueError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="scq-default-value-error"
            >
              {defaultValueError}
            </ODSLabel>
          )}
        </div>
      </div>
    </div>
  );
};

export default SCQSettings;
