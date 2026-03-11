import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FormRow = ({ label, children, className }) => {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <Label className="text-sm font-medium shrink-0">{label}</Label>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};

export default FormRow;
