import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

const ODSToggleButton = ({ className, value, ...props }) => {
  return (
    <Toggle
      className={cn(className)}
      data-value={value}
      {...props}
    />
  );
};

export default ODSToggleButton;
