import React, { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ODSLabel = forwardRef(({ className, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      className={cn(className)}
      {...props}
    />
  );
});

ODSLabel.displayName = "ODSLabel";

export default ODSLabel;
