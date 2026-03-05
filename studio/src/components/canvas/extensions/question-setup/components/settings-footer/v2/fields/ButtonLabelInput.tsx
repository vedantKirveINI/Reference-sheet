import { ODSLabel, ODSTooltip } from "@src/module/ods";
import { SettingsTextField } from "../../components/common-settings/settings-textfield";

interface ButtonLabelInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
}

export const ButtonLabelInput = ({
  value,
  onChange,
  placeholder = "Next",
  helpText,
}: ButtonLabelInputProps) => {
  return (
    <div className="flex flex-col gap-1" data-testid="v2-button-label">
      <div className="flex items-center gap-1">
        <ODSLabel variant="body1">Button Label</ODSLabel>
        {helpText && (
          <ODSTooltip title={helpText} placement="top" arrow>
            <span className="inline-flex items-center text-[#9e9e9e] cursor-help hover:text-[#616161]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </span>
          </ODSTooltip>
        )}
      </div>
      <SettingsTextField
        className="black"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        dataTestId="v2-button-label-input"
      />
    </div>
  );
};

export default ButtonLabelInput;
