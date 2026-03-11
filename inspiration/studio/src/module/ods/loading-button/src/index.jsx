import React, { forwardRef } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { cn } from "@/lib/utils";

const ODSLoadingButton = forwardRef(({ label, children, className, ...props }, ref) => {
  return (
    <LoadingButton
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {label || children}
    </LoadingButton>
  );
});

ODSLoadingButton.displayName = "ODSLoadingButton";

export default ODSLoadingButton;
