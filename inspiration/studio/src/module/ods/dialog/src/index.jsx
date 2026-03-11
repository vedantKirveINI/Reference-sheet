import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ODSDialog = ({
  open,
  onClose,
  dialogTitle,
  dialogContent,
  dialogActions,
  dialogWidth,
  dialogMinHeight,
  dialogHeight,
  className,
  overlayClassName,
  overlayStyle,
  children,
  ...props
}) => {
  // Build style object for responsive width/height
  const contentStyle = {};

  if (dialogWidth) {
    contentStyle.width = dialogWidth;
    contentStyle.maxWidth = dialogWidth;
  } else {
    // Default to responsive width if not provided
    contentStyle.width = "var(--dialog-width)";
    contentStyle.maxWidth = "var(--dialog-width)";
  }

  if (dialogMinHeight) {
    contentStyle.minHeight = dialogMinHeight;
  } else {
    // Default to responsive min-height if not provided
    contentStyle.minHeight = "var(--dialog-min-height)";
  }

  if (dialogHeight) {
    contentStyle.height = dialogHeight;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && onClose) onClose();
      }}
      {...props}
    >
      <DialogContent
        data-testid="ods-dialog-content"
        className={cn(className)}
        style={contentStyle}
        overlayClassName={overlayClassName}
        overlayStyle={overlayStyle}
      >
        {dialogTitle && (
          <DialogHeader data-testid="ods-dialog-title">
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
        )}
        <DialogDescription className="sr-only">Dialog content</DialogDescription>
        {dialogContent || children}
        {dialogActions && (
          <DialogFooter data-testid="ods-dialog-actions">
            {dialogActions}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { showConfirmDialog } from "./utils.jsx";
export default ODSDialog;
