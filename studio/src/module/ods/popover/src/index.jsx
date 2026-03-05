import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ODSPopover = ({ children, open, onOpenChange, content, className, ...props }) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange} {...props}>
      {children && <PopoverTrigger asChild>{children}</PopoverTrigger>}
      <PopoverContent className={cn(className)}>
        {content || children}
      </PopoverContent>
    </Popover>
  );
};

export default ODSPopover;
