import { ODSLabel, ODSTooltip } from "@src/module/ods";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TextCasesDropdownProps {
  value: string | undefined;
  onChange: (value: string) => void;
  helpText?: string;
}

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
    <div className="flex flex-col gap-1" data-testid="v2-text-cases">
      <div className="flex items-center gap-1">
        <ODSLabel variant="body1">Text Cases</ODSLabel>
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
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full" data-testid="v2-text-cases-dropdown">
          <SelectValue placeholder="Select text case" />
        </SelectTrigger>
        <SelectContent>
          {TEXT_CASE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TextCasesDropdown;
