import React, { forwardRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const TooltipWrapper = forwardRef(
  ({ component: Component, title, children, ...props }, ref) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Component {...props} ref={ref}>
              {children}
            </Component>
          </TooltipTrigger>
          <TooltipContent
            sideOffset={14}
            className={cn(
              "text-base bg-[rgba(33,33,33,0.90)] text-white",
              "font-['Inter'] border-[0.75px] border-[#CFD8DC]",
              "w-auto h-auto max-w-64"
            )}
          >
            {title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

TooltipWrapper.displayName = "TooltipWrapper";

export default TooltipWrapper;
