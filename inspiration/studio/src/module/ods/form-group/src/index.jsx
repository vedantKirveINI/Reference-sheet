import React from "react";
import { cn } from "@/lib/utils";

const ODSFormGroup = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default ODSFormGroup;
