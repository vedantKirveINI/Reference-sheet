/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { ODSTooltip } from "@src/module/ods";
import SwitchOption from "../../components/common-settings/switch";

interface SwitchFieldProps {
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  testId?: string;
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  helpIcon: css`
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
    color: #9e9e9e;
    cursor: help;
    
    &:hover {
      color: #616161;
    }
  `,
};

export const SwitchField = ({
  title,
  checked,
  onChange,
  helpText,
  disabled = false,
  disabledTooltip,
  testId,
}: SwitchFieldProps) => {
  const switchContent = (
    <SwitchOption
      title={
        <>
          {title}
          {helpText && (
            <ODSTooltip title={helpText} placement="top" arrow>
              <span css={styles.helpIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </span>
            </ODSTooltip>
          )}
        </>
      }
      variant="black"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      switchProps={{ disabled }}
      dataTestId={testId || `v2-switch-${title.toLowerCase().replace(/\s+/g, "-")}`}
    />
  );

  if (disabled && disabledTooltip) {
    return (
      <div css={styles.container}>
        <ODSTooltip title={disabledTooltip} placement="top-start" arrow>
          {switchContent}
        </ODSTooltip>
      </div>
    );
  }

  return <div css={styles.container}>{switchContent}</div>;
};

export default SwitchField;
