import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Value matches Integration v2: "Yes" | "No". Accepts boolean for backward compat with existing v3-saved state. */
export type YesNoValue = "Yes" | "No" | boolean | null | undefined;

export interface YesNoProps {
  /** Current value. Supports "Yes"/"No" (v2) and true/false (legacy v3) for display. */
  value?: YesNoValue;
  /** Emits "Yes" or "No" so stored values match Integration v2 and rehydrate correctly. */
  onChange?: (value: "Yes" | "No", options?: any) => void;
  disabled?: boolean;
  vertical?: boolean;
  question?: any;
  error?: string;
  isCreator?: boolean;
  dataTestId?: string;
  optionStyle?: React.CSSProperties;
}

/** Normalize value to Yes/No selection for display (v2 strings or v3 booleans). */
function isYesSelected(value: YesNoValue): boolean {
  return value === true || value === "Yes";
}

function isNoSelected(value: YesNoValue): boolean {
  return value === false || value === "No";
}

export function YesNo({
  value,
  onChange,
  disabled = false,
  vertical = false,
  question,
  error,
  isCreator,
  dataTestId,
}: YesNoProps) {
  const isYes = isYesSelected(value);
  const isNo = isNoSelected(value);

  const handleSelect = (selected: "Yes" | "No") => {
    if (disabled || isCreator) return;
    onChange?.(selected, { executeNode: true });
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex gap-3",
          vertical ? "flex-col" : "flex-row"
        )}
        data-testid={dataTestId}
      >
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => handleSelect("Yes")}
          className={cn(
            "flex-1 h-11 gap-2 transition-all font-medium",
            vertical ? "justify-start px-4" : "justify-center min-w-[100px]",
            isYes && "bg-green-50 border-green-500 text-green-700 hover:bg-green-100 hover:text-green-800",
            !isYes && "hover:border-green-300 hover:bg-green-50/50"
          )}
        >
          <Check className={cn(
            "h-4 w-4",
            isYes ? "text-green-600" : "text-muted-foreground"
          )} />
          Yes
        </Button>
        
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => handleSelect("No")}
          className={cn(
            "flex-1 h-11 gap-2 transition-all font-medium",
            vertical ? "justify-start px-4" : "justify-center min-w-[100px]",
            isNo && "bg-red-50 border-red-500 text-red-700 hover:bg-red-100 hover:text-red-800",
            !isNo && "hover:border-red-300 hover:bg-red-50/50"
          )}
        >
          <X className={cn(
            "h-4 w-4",
            isNo ? "text-red-600" : "text-muted-foreground"
          )} />
          No
        </Button>
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export default YesNo;
