import React, { forwardRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const ODSAdvancedLabel = forwardRef(({
  labelText,
  labelSubText,
  leftAdornment,
  rightAdornment,
  fullWidth = false,
  required = false,
  showCheckbox = false,
  onCheckboxChange,
  defaultChecked = false,
  disabled = false,
  labelProps = {},
  subTextProps = {},
  className,
  ...props
}, ref) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start gap-2",
        fullWidth ? "w-full" : "w-64",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      data-testid="oute-ds-advance-label-box"
      {...props}
    >
      {(showCheckbox || leftAdornment) && (
        <div className="flex-shrink-0 pt-0.5" data-testid="oute-ds-advance-label-left-adornment-container">
          {showCheckbox ? (
            <Checkbox
              checked={checked}
              onCheckedChange={(value) => {
                setChecked(value);
                if (onCheckboxChange) onCheckboxChange({ target: { checked: value } });
              }}
              data-testid="oute-ds-advance-label-checkbox"
            />
          ) : leftAdornment}
        </div>
      )}
      <div className="flex-1 min-w-0" data-testid="oute-ds-advance-label-typography-container">
        <Label
          className={cn("truncate block", labelProps.className)}
          data-testid="oute-ds-advance-label-text"
          title={labelText}
          {...labelProps}
        >
          {labelText}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {labelSubText && (
          <Label
            className={cn("text-sm text-muted-foreground truncate block", subTextProps.className)}
            data-testid="oute-ds-advance-label-sub-text"
            title={labelSubText}
            {...subTextProps}
          >
            {labelSubText}
          </Label>
        )}
      </div>
      {rightAdornment && (
        <div className="flex-shrink-0" data-testid="oute-ds-advance-label-right-container">
          {rightAdornment}
        </div>
      )}
    </div>
  );
});

ODSAdvancedLabel.displayName = "ODSAdvancedLabel";

export default ODSAdvancedLabel;
