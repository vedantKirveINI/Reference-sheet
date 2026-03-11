import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DrawerHeader as ShadcnDrawerHeader, DrawerFooter as ShadcnDrawerFooter } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * DrawerShell - Wrapper component for Sheet/SheetContent
 * Provides a consistent drawer container with open/close state management
 */
export const DrawerShell = ({ open, onClose, width = "420px", children, className, ...props }) => {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <SheetContent
        side="right"
        className={cn("p-0 flex flex-col [&>button]:hidden", className)}
        style={{ width, maxWidth: "90vw" }}
        {...props}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
};

/**
 * DrawerHeader - Header component for drawer panels
 * Provides title, subtitle, and close button
 */
export const DrawerHeader = ({ title, subtitle, onClose, className, ...props }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-4 border-b border-gray-200",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h2
            className="text-xl font-semibold text-gray-900 truncate"
            style={{ fontFamily: "'Radio Canada Big', sans-serif" }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p
            className="text-sm text-gray-500 mt-1"
            style={{ fontFamily: "Archivo, sans-serif" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
};

/**
 * DrawerBody - Body component for drawer panels
 * Provides flexible padding and scrolling
 */
export const DrawerBody = ({ padding = "p-6", className, children, ...props }) => {
  return (
    <div
      className={cn("flex-1 overflow-auto", padding, className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * DrawerFooter - Footer component for drawer panels
 * Re-exports the shadcn DrawerFooter for consistency
 */
export const DrawerFooter = ShadcnDrawerFooter;
