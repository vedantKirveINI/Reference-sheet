import React from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { ODSAdvancedLabel } from "../../index.js";
import { cn } from "@/lib/utils";

const ODSRadio = ({
  radioProps,
  formControlLabelProps,
  labelText,
  labelSubText,
  labelProps = {},
  variant = "default",
  subTextProps = {},
  className,
  color,
  disableRipple,
  size,
  ...props
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)} data-testid="ods-radio-label" {...formControlLabelProps}>
      <RadioGroupItem
        value={radioProps?.value || ""}
        disabled={formControlLabelProps?.disabled}
        className={cn(
          variant === "black" && "data-[state=checked]:border-[#212121] data-[state=checked]:text-[#212121]",
          className
        )}
        {...radioProps}
        {...props}
      />
      {labelText && (
        <ODSAdvancedLabel
          labelText={labelText}
          labelSubText={labelSubText}
          labelProps={labelProps}
          subTextProps={subTextProps}
          fullWidth={true}
          disabled={formControlLabelProps?.disabled}
        />
      )}
    </div>
  );
};

export default ODSRadio;
