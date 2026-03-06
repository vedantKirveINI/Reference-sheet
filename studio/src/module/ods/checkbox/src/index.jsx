import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ODSCheckbox = ({ checked, onCheckedChange, onChange, labelText, disabled, className, id, ...props }) => {
  const handleCheckedChange = (newChecked) => {
    if (onCheckedChange) onCheckedChange(newChecked);
    if (onChange) onChange({ target: { checked: newChecked } });
  };

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className={cn(className)}
        {...props}
      />
      {labelText && (
        <Label
          htmlFor={id}
          className={cn(
            "cursor-pointer select-none",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {labelText}
        </Label>
      )}
    </div>
  );
};

export default ODSCheckbox;
