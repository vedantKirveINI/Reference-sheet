import React, { forwardRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ODSDrawer = forwardRef(({
  open,
  onOpenChange,
  onDrawerHide,
  anchor = "left",
  title,
  className,
  children,
  ...props
}, ref) => {
  const side = anchor === "right" ? "right" : "left";

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (onOpenChange) onOpenChange(isOpen);
        if (!isOpen && onDrawerHide) onDrawerHide();
      }}
      {...props}
    >
      <SheetContent ref={ref} side={side} className={cn(className)}>
        {title && (
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}
        {children}
      </SheetContent>
    </Sheet>
  );
});

ODSDrawer.displayName = "ODSDrawer";

export default ODSDrawer;
