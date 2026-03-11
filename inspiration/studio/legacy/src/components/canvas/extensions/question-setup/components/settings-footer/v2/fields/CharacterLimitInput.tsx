/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { ODSLabel, ODSTooltip } from "@src/module/ods";
import { SettingsTextField } from "../../components/common-settings/settings-textfield";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";

interface CharacterLimitInputProps {
  minChar: string;
  maxChar: string;
  onChange: (changes: any) => void;
  settings: any;
  error?: string;
  helpText?: string;
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: 4px;
  `,
  helpIcon: css`
    display: inline-flex;
    align-items: center;
    color: #9e9e9e;
    cursor: help;
    
    &:hover {
      color: #616161;
    }
  `,
  note: css`
    font-size: 11px;
    color: #757575;
    margin-top: -4px;
  `,
  inputRow: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  inputWrapper: css`
    flex: 1;
  `,
  separator: css`
    color: #757575;
    font-weight: 500;
  `,
  error: css`
    color: #d32f2f;
    font-size: 12px;
    margin-top: 4px;
  `,
};

export const CharacterLimitInput = ({
  minChar,
  maxChar,
  onChange,
  settings,
  error,
  helpText,
}: CharacterLimitInputProps) => {
  const regex = REGEX_CONSTANTS.NUMBER_REGEX;

  const handleChange = (value: string, type: "minChar" | "maxChar") => {
    if (value?.trim().length > 15) {
      return;
    }

    if (regex.test(value)) {
      const numericValue = Number(value);
      let charLimitError = "";

      if (type === "minChar" && settings?.maxChar && numericValue > Number(settings.maxChar)) {
        charLimitError = "Min cannot be greater than max";
      } else if (type === "maxChar" && settings?.minChar && numericValue < Number(settings.minChar)) {
        charLimitError = "Max cannot be less than min";
      }

      const isValueZero = Number(value) === 0 && value !== "";

      onChange({
        settings: {
          ...settings,
          [type]: isValueZero ? "0" : value,
          errors: {
            ...settings?.errors,
            charLimitError,
          },
        },
      });
    }
  };

  return (
    <div css={styles.container} data-testid="v2-character-limit">
      <div css={styles.header}>
        <ODSLabel variant="body1">Character Limit</ODSLabel>
        {helpText && (
          <ODSTooltip title={helpText} placement="top" arrow>
            <span css={styles.helpIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </span>
          </ODSTooltip>
        )}
      </div>
      <div css={styles.note}>Default max character limit is 255</div>
      <div css={styles.inputRow}>
        <div css={styles.inputWrapper}>
          <SettingsTextField
            value={minChar}
            className="black"
            placeholder="Min"
            onChange={(val) => handleChange(val, "minChar")}
            dataTestId="v2-char-limit-min"
          />
        </div>
        <span css={styles.separator}>-</span>
        <div css={styles.inputWrapper}>
          <SettingsTextField
            value={maxChar}
            className="black"
            placeholder="Max"
            onChange={(val) => handleChange(val, "maxChar")}
            dataTestId="v2-char-limit-max"
          />
        </div>
      </div>
      {error && <div css={styles.error}>{error}</div>}
    </div>
  );
};

export default CharacterLimitInput;
