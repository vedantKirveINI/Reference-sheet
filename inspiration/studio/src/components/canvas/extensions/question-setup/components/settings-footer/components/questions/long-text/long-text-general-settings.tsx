import type React from "react";
import { ODSLabel } from "@src/module/ods";
import QuestionAlignment from "../../common-settings/alignment";

import DefaultValueFx from "../../common-settings/defaultValueFx";
import SwitchOption from "../../common-settings/switch";
import { CHARACTERS, type CharLimitProps, TEXT_CASE_OPTIONS,  } from "../../../constants/constants";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";
import { ERROR_MESSAGE } from "../../../constants/errorMessages";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";
import { SettingsTextField } from "../../common-settings/settings-textfield";
import { DropdownV2 } from "../../common-settings/dropdown-v2";
interface LongTextSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  variables?: any;
  disableQuestionAlignment: boolean;
}

const LongTextGeneralSettings = ({
  onChange,
  question,
  mode,
  variables = {},
  disableQuestionAlignment,
}: LongTextSettingsProps) => {
  const settings = question?.settings;
  const regex = REGEX_CONSTANTS.NUMBER_REGEX;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };
  const onCharacterLimitChange = (value: string, limit: CharLimitProps) => {
    const minChar = Number(settings.minChar);
    const maxChar = Number(settings.maxChar);
    let error = "";

    if (value === "") {
      onChange({
        settings: {
          ...settings,
          [limit]: value,
          errors: {
            charLimitError: "",
          },
        },
      });
      return;
    }

    // Validate if the value is more than 15 characters long
    if (value?.trim().length > 15) {
      return;
    }

    if (regex.test(value)) {
      const numericValue = Number(value);

      if (limit === CHARACTERS.MIN_CHAR && maxChar && numericValue > maxChar) {
        error = ERROR_MESSAGE.LONG_TEXT.minChar;
      } else if (
        limit === CHARACTERS.MAX_CHAR &&
        minChar &&
        numericValue < minChar
      ) {
        error = ERROR_MESSAGE.LONG_TEXT.maxChar;
      }
      onChange({
        settings: {
          ...settings,
          [limit]: value,
          errors: {
            charLimitError: error,
          },
        },
      });
    }
  };

  return (
    <>
      <div style={styles.container} data-testid="long-text-general-settings">
        <div style={styles.wrapperContainer}>
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
          <div style={styles.getInputWrapperContainerStyle()}>
            <ODSLabel variant="body1">Character Limit</ODSLabel>
            <div style={styles.inputContainer}>
              <SettingsTextField
                value={settings?.minChar || ""}
                className="black"
                placeholder="Min"
                onChange={(val) =>
                  onCharacterLimitChange(val, CHARACTERS.MIN_CHAR)
                }
                dataTestId="long-text-settings-char-limit-min"
                InputProps={{
                  sx: styles.getInputStyle(),
                }}
              />
              -
              <SettingsTextField
                value={settings?.maxChar || ""}
                className="black"
                placeholder="Max"
                onChange={(val) =>
                  onCharacterLimitChange(val, CHARACTERS.MAX_CHAR)
                }
                dataTestId="long-text-settings-char-limit-max"
                InputProps={{
                  sx: styles.getInputStyle(),
                }}
              />
            </div>
            {settings?.errors?.charLimitError && (
              <ODSLabel
                variant="body1"
                color="error"
                data-testid="long-text-settings-range-error"
                style={{ position: "absolute", bottom: "-2em" }}
              >
                {settings.errors.charLimitError}
              </ODSLabel>
            )}
          </div>
        </div>

        <div style={styles.wrapperContainer}>
          <DropdownV2
            label="Text Cases"
            variant="black"
            value={
              TEXT_CASE_OPTIONS.find(
                (option) => option.value === settings?.textTransformation?.case
              )?.label || null
            }
            options={TEXT_CASE_OPTIONS}
            onChange={(value) => {
              updateSettings("textTransformation", { case: value?.value });
            }}
            isOptionEqualToValue={(option, value) => {
              return option?.label === value;
            }}
            selecOnFocus={false}
            placeholder="Select text case"
            dataTestId="long-text-settings-text-case"
          />

          <DefaultValueFx
            settings={settings}
            variables={variables}
            onChange={updateSettings}
            dataTestid="question-settings-default-value"
          />
        </div>
      </div>
    </>
  );
};

export default LongTextGeneralSettings;
