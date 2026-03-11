import React, { useState, useEffect } from "react";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
export { showAlert } from "./utils.jsx";

const ODSAlert = ({
  autoHideDuration = 3000,
  anchorOrigin = { vertical: "top", horizontal: "right" },
  open = false,
  type,
  children,
  showProgress = false,
  progressProps = {},
  onClose,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setIsOpen(open);
    if (open && showProgress) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - (100 / (autoHideDuration / 100))));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [open, showProgress, autoHideDuration]);

  const handleOpenChange = (openState) => {
    setIsOpen(openState);
    if (!openState && onClose) {
      onClose(null, "timeout");
    }
  };

  if (!isOpen) return null;

  return (
    <Toast
      variant={type || "default"}
      open={isOpen}
      onOpenChange={handleOpenChange}
      duration={autoHideDuration}
      data-testid="ods-alert"
      className={cn(
        "fixed",
        anchorOrigin.vertical === "top" && "top-4",
        anchorOrigin.vertical === "bottom" && "bottom-4",
        anchorOrigin.horizontal === "left" && "left-4",
        anchorOrigin.horizontal === "right" && "right-4",
        anchorOrigin.horizontal === "center" && "left-1/2 -translate-x-1/2",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1 w-full">
        {children}
        {showProgress && (
          <div
            className={cn("h-1 bg-current opacity-30 rounded-full transition-all", progressProps.className)}
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
    </Toast>
  );
};

export default ODSAlert;
