import SwitchOption from "../../components/common-settings/switch";
import { ODSTooltip } from "@src/module/ods";

interface RequiredToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
}

export const RequiredToggle = ({ checked, onChange, helpText }: RequiredToggleProps) => {
  return (
    <div className="flex flex-col gap-1">
      <SwitchOption
        title={
          <>
            Required
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
        dataTestId="v2-required-toggle"
      />
    </div>
  );
};

export default RequiredToggle;
