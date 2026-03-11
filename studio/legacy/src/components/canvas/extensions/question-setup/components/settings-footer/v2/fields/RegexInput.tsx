/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { ODSLabel, ODSTooltip } from "@src/module/ods";
import { SettingsTextField } from "../../components/common-settings/settings-textfield";

interface RegexInputProps {
  regex: string;
  regexError: string;
  onChange: (key: string, value: any) => void;
  helpText?: string;
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
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
  row: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  `,
  presets: css`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  `,
  presetButton: css`
    padding: 4px 8px;
    font-size: 11px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #fafafa;
    color: #616161;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #e3f2fd;
      border-color: #1976d2;
      color: #1976d2;
    }
  `,
};

const REGEX_PRESETS = [
  { label: "Email", value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
  { label: "Phone", value: "^[0-9]{10}$" },
  { label: "Alphanumeric", value: "^[a-zA-Z0-9]+$" },
  { label: "Numbers Only", value: "^[0-9]+$" },
  { label: "Letters Only", value: "^[a-zA-Z]+$" },
];

export const RegexInput = ({ regex, regexError, onChange, helpText }: RegexInputProps) => {
  const handlePresetClick = (presetValue: string) => {
    onChange("regex", presetValue);
  };

  return (
    <div css={styles.container} data-testid="v2-regex-input">
      <div css={styles.header}>
        <ODSLabel variant="body1">Validation Pattern (Regex)</ODSLabel>
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

      <div css={styles.presets}>
        <ODSLabel variant="body2" style={{ marginRight: 4, color: "#757575" }}>
          Quick presets:
        </ODSLabel>
        {REGEX_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            css={styles.presetButton}
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div css={styles.row}>
        <SettingsTextField
          label="Pattern"
          className="black"
          value={regex}
          placeholder="e.g. ^[A-Za-z]{5}\d{4}[A-Za-z]{1}$"
          onChange={(val) => onChange("regex", val)}
          dataTestId="v2-regex-pattern"
        />
        <SettingsTextField
          label="Error Message"
          className="black"
          value={regexError}
          placeholder="Enter custom error message"
          onChange={(val) => onChange("regexErrorMessage", val)}
          dataTestId="v2-regex-error"
        />
      </div>
    </div>
  );
};

export default RegexInput;
