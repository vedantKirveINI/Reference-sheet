import React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const ODSSeparator = ({ orientation = "horizontal", className, ...props }) => {
  return (
    <Separator
      orientation={orientation}
      className={cn(className)}
      {...props}
    />
  );
};

export default ODSSeparator;
