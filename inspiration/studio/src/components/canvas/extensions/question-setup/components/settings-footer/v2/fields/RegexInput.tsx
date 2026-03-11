import { ODSLabel, ODSTooltip } from "@src/module/ods";
import { SettingsTextField } from "../../components/common-settings/settings-textfield";

interface RegexInputProps {
  regex: string;
  regexError: string;
  onChange: (key: string, value: any) => void;
  helpText?: string;
}

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
    <div className="flex flex-col gap-3" data-testid="v2-regex-input">
      <div className="flex items-center gap-1">
        <ODSLabel variant="body1">Validation Pattern (Regex)</ODSLabel>
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

      <div className="flex flex-wrap gap-1.5 mb-2">
        <ODSLabel variant="body2" style={{ marginRight: 4, color: "#757575" }}>
          Quick presets:
        </ODSLabel>
        {REGEX_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="px-2 py-1 text-[11px] border border-[#e0e0e0] rounded bg-[#fafafa] text-[#616161] cursor-pointer transition-all duration-200 hover:bg-[#e3f2fd] hover:border-[#1976d2] hover:text-[#1976d2]"
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1">
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
