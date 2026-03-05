import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ODSTooltip = ({ children, title, className, ...props }) => {
  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className={cn(className)}>
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ODSTooltip;
