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
              <span className="inline-flex items-center ml-1 text-[#9e9e9e] cursor-help hover:text-[#616161]">
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
      <div className="flex flex-col gap-1">
        <ODSTooltip title={disabledTooltip} placement="top-start" arrow>
          {switchContent}
        </ODSTooltip>
      </div>
    );
  }

  return <div className="flex flex-col gap-1">{switchContent}</div>;
};

export default SwitchField;
