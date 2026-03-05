import { useEffect } from "react";
import { Mode, ViewPort } from "@src/module/constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getContainerStyles } from "./styles";

export type YesNoProps = {
  isCreator?: boolean;
  vertical?: boolean;
  value?: any;
  onChange: any;
  question?: any;
  error?: string | undefined;
  mode?: Mode;
  enableKeyboardShortcuts?: boolean;
  viewPort?: ViewPort;
  disabled?: boolean;
  theme?: any;
  optionStyle?: any;
  dataTestId?: string;
};

const OPTION_LIST = ["Yes", "No"] as const;

export function YesNo({
  value,
  vertical = true,
  onChange = () => {},
  question,
  mode,
  isCreator,
  enableKeyboardShortcuts = false,
  viewPort = ViewPort.DESKTOP,
  disabled = false,
  theme = {},
  optionStyle = {},
  dataTestId,
}: YesNoProps) {
  const isAugmentorAvailable = question?.augmentor?.url;
  const themeColor = theme?.styles?.buttons;

  useEffect(() => {
    if (isCreator) return;
    if (question?.settings?.defaultChoice !== "") {
      onChange(value || question?.settings?.defaultChoice);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enableKeyboardShortcuts || isCreator || mode === Mode.CLASSIC)
        return;
      const key = event.key.toLowerCase();
      if (key === "y") onChange("Yes");
      else if (key === "n") onChange("No");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardShortcuts, isCreator, mode, onChange]);

  const handleValueChange = (val: string) => {
    if (!isCreator && !disabled && val) {
      onChange(val);
    }
  };

  const containerStyles = getContainerStyles({
    vertical,
    settings: question?.settings,
    mode,
    isAugmentorAvailable,
    viewPort,
  });

  return (
    <div
      style={containerStyles}
      data-testid={
        dataTestId ? dataTestId + "-container" : "yes-no-options-container"
      }
    >
      <RadioGroup
        value={value ?? ""}
        onValueChange={handleValueChange}
        className="flex w-full gap-[0.875em]"
        style={{
          flexDirection: containerStyles.flexDirection,
          ...(containerStyles.alignItems && {
            alignItems: containerStyles.alignItems,
          }),
          ...(containerStyles.justifyContent && {
            justifyContent: containerStyles.justifyContent,
          }),
        }}
      >
        {OPTION_LIST.map((option, i) => {
          const isOptionChecked = option === value;
          const optionForDTId = i === 0 ? "yes" : "no";
          const _dataTestId = dataTestId
            ? `${dataTestId}-option-${i}`
            : `yes-no-option-${optionForDTId}`;

          return (
            <Label
              key={`yes_no_${i}`}
              htmlFor={_dataTestId}
              data-testid={_dataTestId}
              className={cn(
                "flex min-h-[2.75rem] min-w-[10em] items-center gap-3 rounded-xl border px-4 py-3 text-base font-medium transition-all duration-200",
                "border-black/[0.08] bg-black/[0.04] shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/10",
                !isCreator &&
                  !disabled &&
                  "cursor-pointer hover:bg-black/[0.06] hover:border-black/[0.1] dark:hover:bg-white/15 dark:hover:border-white/20",
                isCreator &&
                  "cursor-default pointer-events-none select-none",
                isOptionChecked &&
                  "border-primary shadow-sm ring-2 ring-primary/20",
                disabled &&
                  "cursor-not-allowed opacity-50"
              )}
              style={{
                ...(optionStyle as React.CSSProperties),
                ...(isOptionChecked && themeColor && { borderColor: themeColor }),
              }}
            >
              <RadioGroupItem
                value={option}
                id={_dataTestId}
                disabled={disabled}
                className="sr-only"
                aria-hidden
                data-testid="yes-no-single-choice-unchecked"
              />
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  "border-muted-foreground/40 bg-background",
                  isOptionChecked && "border-primary bg-transparent"
                )}
                style={{
                  ...(isOptionChecked && themeColor && { borderColor: themeColor }),
                }}
                aria-hidden
              >
                {isOptionChecked && (
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-primary shrink-0"
                    style={
                      themeColor ? { backgroundColor: themeColor } : undefined
                    }
                  />
                )}
              </span>
              <span
                className="select-none text-foreground"
                style={themeColor ? { color: themeColor } : undefined}
              >
                {option}
              </span>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
