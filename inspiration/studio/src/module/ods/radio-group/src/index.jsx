import React from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const ODSRadioGroup = ({ className, ...props }) => {
  return (
    <RadioGroup
      data-testid="ods-radio-group"
      className={cn(className)}
      {...props}
    >
      {props.children}
    </RadioGroup>
  );
};

export default ODSRadioGroup;
