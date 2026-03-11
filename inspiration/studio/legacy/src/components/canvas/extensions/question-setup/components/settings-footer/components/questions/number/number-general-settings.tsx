/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import type React from "react";
import { ODSLabel } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import DefaultValueFx from "../../common-settings/defaultValueFx";
import { NUMBERS } from "../../../constants/constants";
import CTAEditor from "../../common-settings/cta-editor";
import { ERROR_MESSAGE } from "../../../constants/errorMessages";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";
import { SettingsTextField } from "../../common-settings/settings-textfield";

interface NumberSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  variables?: any;
  disableQuestionAlignment?: boolean;
}

const NumberSettings = ({
  onChange,
  question,
  mode,
  variables = {},
  disableQuestionAlignment = false,
}: NumberSettingsProps) => {
  const settings = question?.settings;
  const regex = REGEX_CONSTANTS.NUMBER_REGEX;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  const handleMinMaxNumberChange = (limit: string, value: any) => {
    let error = "";
    const allowNegative = settings?.allowNegative;
    const minNumber = settings?.min;
    const maxNumber = settings?.max;
    const validRegex = allowNegative
      ? REGEX_CONSTANTS.ALLOW_NEGATIVE_NUMBER_REGEX
      : REGEX_CONSTANTS.ALLOW_POSITIVE_NUMBER_REGEX;

    if (value === "") {
      onChange({
        settings: {
          ...settings,
          [limit]: value,
          errors: { minMaxNumberError: "" },
        },
      });
      return;
    }
    if (validRegex.test(value)) {
      const numericValue = Number(value);

      if (
        limit === NUMBERS.MIN_NUMBER &&
        maxNumber !== "" &&
        numericValue >= maxNumber
      ) {
        error = ERROR_MESSAGE.NUMBER.minNumberError;
      } else if (
        limit === NUMBERS.MAX_NUMBER &&
        minNumber !== "" &&
        numericValue <= minNumber
      ) {
        error = ERROR_MESSAGE.NUMBER.maxNumberError;
      }

      if (settings?.allowFraction && value.includes(".")) {
        const [, decimals] = value.split(".");
        if (decimals && decimals.length > 2) {
          error = ERROR_MESSAGE.NUMBER.allowFraction;
        }
      }

      onChange({
        settings: {
          ...settings,
          [limit]: value,
          errors: { minMaxNumberError: error },
        },
      });
    }
  };

  const validateNumber = (value: string, isMin: boolean) => {
    if (!value) {
      handleMinMaxNumberChange(
        isMin ? NUMBERS.MIN_NUMBER : NUMBERS.MAX_NUMBER,
        ""
      );
      return;
    }
    const allowFraction = settings?.allowFraction;

    if (!allowFraction && value.includes(".")) {
      return;
    }
    if (allowFraction) {
      if (value.indexOf(".") !== value.lastIndexOf(".")) {
        return;
      }
      const [, decimals] = value.split(".");
      if (decimals && decimals.length > 2) {
        return;
      }
    }

    const numericPart = value.replace(/[^0-9]/g, "");
    if (numericPart.length > 15) {
      return;
    }

    handleMinMaxNumberChange(
      isMin ? NUMBERS.MIN_NUMBER : NUMBERS.MAX_NUMBER,
      value
    );
  };

  const handleAllowNegativeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedSettings = { ...settings };
    const allowNegative = event.target.checked;

    updatedSettings.allowNegative = allowNegative;
    if (!allowNegative) {
      if (settings.min < 0) {
        updatedSettings[NUMBERS.MIN_NUMBER] = "";
      }
      if (settings.max < 0) {
        updatedSettings[NUMBERS.MAX_NUMBER] = "";
      }
    }
    onChange({ settings: updatedSettings });
  };

  const handleAllowFractionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedSettings = { ...settings };
    const allowFraction = event.target.checked;

    updatedSettings.allowFraction = allowFraction;
    if (allowFraction) {
      if (settings.min || settings.min === 0)
        updatedSettings[NUMBERS.MIN_NUMBER] = parseFloat(settings.min).toFixed(
          2
        );
      if (settings.max || settings.max === 0)
        updatedSettings[NUMBERS.MAX_NUMBER] = parseFloat(settings.max).toFixed(
          2
        );
    } else {
      if (settings.min?.toString().includes("."))
        updatedSettings[NUMBERS.MIN_NUMBER] = Math.floor(settings.min);
      if (settings.max?.toString().includes("."))
        updatedSettings[NUMBERS.MAX_NUMBER] = Math.floor(settings.max);
    }
    onChange({ settings: updatedSettings });
  };

  return (
    <div css={styles.container} data-testid="number-general-settings">
      <div css={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />

        <SwitchOption
          key="number-required"
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
          key="allow-negative"
          variant="black"
          title="Allow Negative"
          checked={settings?.allowNegative}
          onChange={handleAllowNegativeChange}
          dataTestId="number-settings-allow-negative-toggle"
        />

        <SwitchOption
          key="allow-fraction"
          variant="black"
          title="Allow Fraction upto 2"
          checked={settings?.allowFraction}
          onChange={handleAllowFractionChange}
          dataTestId="number-settings-allow-fraction-toggle"
        />
      </div>
      <div css={styles.wrapperContainer}>
        <DefaultValueFx
          settings={settings}
          variables={variables}
          onChange={updateSettings}
          dataTestid="question-settings-default-value"
        />

        <div css={styles.getInputWrapperContainerStyle()}>
          <ODSLabel variant="body1">Number Range</ODSLabel>
          <div css={styles.inputContainer}>
            <SettingsTextField
              value={settings?.min === 0 ? "0" : settings?.min || ""}
              className="black"
              placeholder="Min"
              onChange={(val) => {
                validateNumber(val, true);
              }}
              dataTestId="number-settings-range-min-input"
              InputProps={{
                sx: styles.getInputStyle(),
              }}
            />
            -
            <SettingsTextField
              value={settings?.max === 0 ? "0" : settings?.max || ""}
              className="black"
              placeholder="Max"
              onChange={(val) => {
                validateNumber(val, false);
              }}
              dataTestId="number-settings-range-max-input"
              InputProps={{
                sx: styles.getInputStyle(),
              }}
            />
          </div>
          {settings?.errors?.minMaxNumberError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="number-settings-range-error"
              style={{ position: "absolute", bottom: "-2em" }}
            >
              {settings.errors.minMaxNumberError}
            </ODSLabel>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumberSettings;
