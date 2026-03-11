/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { ODSLabel, ODSTooltip } from "@src/module/ods";
import { MenuItem, Select, FormControl } from "@mui/material";

interface TextCasesDropdownProps {
  value: string | undefined;
  onChange: (value: string) => void;
  helpText?: string;
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
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
};

const TEXT_CASE_OPTIONS = [
  { value: "", label: "None" },
  { value: "uppercase", label: "UPPERCASE" },
  { value: "lowercase", label: "lowercase" },
  { value: "capitalize", label: "Title Case" },
];

export const TextCasesDropdown = ({
  value,
  onChange,
  helpText,
}: TextCasesDropdownProps) => {
  return (
    <div css={styles.container} data-testid="v2-text-cases">
      <div css={styles.header}>
        <ODSLabel variant="body1">Text Cases</ODSLabel>
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
      <FormControl size="small" fullWidth>
        <Select
          value={value || ""}
          onChange={(e) => onChange(e.target.value as string)}
          size="small"
          data-testid="v2-text-cases-dropdown"
        >
          {TEXT_CASE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TextCasesDropdown;
