import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ODSSwitch = ({ checked, onCheckedChange, onChange, labelText, disabled, className, id, ...props }) => {
  const handleCheckedChange = (newChecked) => {
    if (onCheckedChange) onCheckedChange(newChecked);
    if (onChange) onChange({ target: { checked: newChecked } });
  };

  return (
    <div className="flex items-center gap-2" data-testid="oute-ds-switch-container">
      <Switch
        id={id}
        data-testid="oute-ds-switch"
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

export default ODSSwitch;
