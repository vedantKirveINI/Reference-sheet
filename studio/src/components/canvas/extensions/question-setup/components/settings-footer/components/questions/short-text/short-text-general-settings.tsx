import { ODSLabel } from "@src/module/ods";
import QuestionAlignment from "../../common-settings/alignment";
import DefaultValueFx from "../../common-settings/defaultValueFx";
import { styles } from "./styles";
import SwitchOption from "../../common-settings/switch";
import { CHARACTERS, CharLimitProps, TEXT_CASE_OPTIONS,  } from "../../../constants/constants";
import CTAEditor from "../../common-settings/cta-editor";
import { SettingsTextField } from "../../common-settings/settings-textfield";
import { DropdownV2 } from "../../common-settings/dropdown-v2";
import { ERROR_MESSAGE } from "../../../constants/errorMessages";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";
interface ShortTextGeneralSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  variables?: any;
  disableQuestionAlignment?: boolean;
}

const ShortTextGeneralSettings = ({
  question,
  onChange,
  mode,
  variables = {},
  disableQuestionAlignment = false,
}: ShortTextGeneralSettingsProps) => {
  const settings = question?.settings;
  const regex = REGEX_CONSTANTS.NUMBER_REGEX;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  const onCharacterLimitChange = (value: string, limit: CharLimitProps) => {
    const minChar = Number(settings.minChar);
    const maxChar = Number(settings.maxChar);
    let error = "";

    // Validate if the value is more than 15 characters long
    if (value?.trim().length > 15) {
      return;
    }

    if (regex.test(value)) {
      const numericValue = Number(value);

      if (limit === CHARACTERS.MIN_CHAR && maxChar && numericValue > maxChar) {
        error = ERROR_MESSAGE.SHORT_TEXT.minChar;
      } else if (
        limit === CHARACTERS.MAX_CHAR &&
        minChar &&
        numericValue < minChar
      ) {
        error = ERROR_MESSAGE.SHORT_TEXT.maxChar;
      }

      const isValueZero = Number(value) === 0 && value !== "";

      onChange({
        settings: {
          ...settings,
          [limit]: isValueZero ? "0" : value,
          errors: {
            charLimitError: error,
          },
        },
      });
    }
  };

  return (
    <div style={styles.container} data-testid="short-text-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          style={{ width: "100%" }}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          title="Required"
          variant="black"
          styles={{ width: "100%" }}
          checked={settings?.required}
          onChange={(e) => updateSettings("required", e.target.checked)}
          dataTestId="question-settings-required-toggle"
        />
        <SwitchOption
          title="Mask Response"
          variant="black"
          styles={{ width: "100%" }}
          checked={settings?.maskResponse}
          onChange={(e) => updateSettings("maskResponse", e.target.checked)}
          dataTestId="short-text-settings-mask-toggle"
        />
        <SettingsTextField
          label="Tooltip Text"
          className="black"
          value={settings?.toolTipText || ""}
          placeholder="Enter tooltip text here"
          onChange={(val) => updateSettings("toolTipText", val)}
          dataTestId="short-text-settings-tooltip"
        />
        <CTAEditor style={{}} />
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
          dataTestId="short-text-settings-text-case"
        />
        <DefaultValueFx
          settings={settings}
          variables={variables}
          onChange={updateSettings}
          dataTestid={"question-settings-default-value"}
        />
        <div style={styles.getInputWrapperContainerStyle()}>
          <div style={styles.noteContainer}>
            <ODSLabel variant="body1">Character Limit</ODSLabel>
            <ODSLabel
              children={"Note: Default max character limit is 255"}
              variant="body2"
              data-testid="short-text-settings-character-limit-note"
            />
          </div>
          <div style={styles.inputContainer}>
            <SettingsTextField
              value={settings?.minChar || ""}
              className="black"
              placeholder="Min"
              onChange={(val) =>
                onCharacterLimitChange(val, CHARACTERS.MIN_CHAR)
              }
              dataTestId="short-text-settings-char-limit-min"
              InputProps={{
                sx: styles.getInputStyle(),
              }}
            />
            -
            <SettingsTextField
              value={settings?.maxChar || ""}
              className="black"
              placeholder="Max"
              onChange={(val) => {
                onCharacterLimitChange(val, CHARACTERS.MAX_CHAR);
              }}
              dataTestId="short-text-settings-char-limit-max"
              InputProps={{
                sx: styles.getInputStyle(),
              }}
            />
          </div>
          {settings?.errors?.charLimitError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="short-text-settings-range-error"
              style={{ position: "absolute", bottom: "-2em" }}
            >
              {settings.errors.charLimitError}
            </ODSLabel>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortTextGeneralSettings;
