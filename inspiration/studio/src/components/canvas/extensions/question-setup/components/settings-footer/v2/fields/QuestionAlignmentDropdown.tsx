import { ODSLabel, ODSTooltip } from "@src/module/ods";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionAlignmentDropdownProps {
  value: string | undefined;
  onChange: (value: string) => void;
  helpText?: string;
}

const ALIGNMENT_OPTIONS = [
  { value: "center", label: "Center" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

export const QuestionAlignmentDropdown = ({
  value,
  onChange,
  helpText,
}: QuestionAlignmentDropdownProps) => {
  return (
    <div className="flex flex-col gap-1" data-testid="v2-question-alignment">
      <div className="flex items-center gap-1">
        <ODSLabel variant="body1">Question Alignment</ODSLabel>
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
      <Select
        value={value || "center"}
        onValueChange={onChange}
        data-testid="v2-question-alignment-dropdown"
      >
        <SelectTrigger className="w-full h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ALIGNMENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default QuestionAlignmentDropdown;
