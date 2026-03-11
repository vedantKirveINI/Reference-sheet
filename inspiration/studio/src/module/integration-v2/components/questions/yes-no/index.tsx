import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type YesNoOption = "Yes" | "No";

const OPTION_LIST: YesNoOption[] = ["Yes", "No"];

export type YesNoQuestionProps = {
  isCreator?: boolean;
  vertical?: boolean;
  value?: YesNoOption | string | null;
  onChange: (value: YesNoOption, options?: any) => void;
  question?: any;
  error?: string;
  disabled?: boolean;
  optionStyle?: React.CSSProperties;
  dataTestId?: string;
};

export function YesNoQuestion({
  value,
  vertical = true,
  onChange,
  question,
  isCreator,
  disabled = false,
  optionStyle = {},
  dataTestId,
}: YesNoQuestionProps) {
  useEffect(() => {
    if (isCreator) return;
    if (question?.settings?.defaultChoice !== "") {
      const current = value as YesNoOption | string | null | undefined;
      if (!current) {
        onChange(question?.settings?.defaultChoice);
      }
    }
  }, []);

  const containerTestId = dataTestId
    ? `${dataTestId}-container`
    : "yes-no-options-container";


  return (
    <RadioGroup
      data-testid={containerTestId}
      className={cn(
        "ml-px w-full gap-[0.875em] flex",
        vertical ? "flex-col items-start" : "flex-row items-center"
      )}
      value={(value || "") as string}
      onValueChange={(val) => {
        if (!isCreator && !disabled && val) {
          onChange(val as YesNoOption);
        }
      }}
    >
      {OPTION_LIST.map((option, index) => {
        const optionForDTId = index === 0 ? "yes" : "no";
        const optionTestId = dataTestId
          ? `${dataTestId}-option-${index}`
          : `yes-no-option-${optionForDTId}`;
        const optionId = optionTestId;
        const isSelected = option === (value || "");

        return (
          <Label
            key={`yes_no_${index}`}
            htmlFor={optionId}
            data-testid={optionTestId}
            className={cn(
              "flex items-center gap-2 rounded-md border border-[rgba(0,0,0,0.20)] bg-[#e5e5e5] px-4 py-3",
              "min-w-[8rem] w-[8rem] cursor-pointer",
              "transition-colors",
              isSelected && "border-black bg-[#e0e0e0]",
              optionStyle as any
            )}
          >
            <RadioGroupItem
              value={option}
              id={optionId}
              disabled={disabled}
            />
            <span className="text-base">{option}</span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}

export default YesNoQuestion;

