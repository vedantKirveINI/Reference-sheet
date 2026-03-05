import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, getStatus } from "./config";

const HeaderStatus = ({
  isDraft,
  isPublished,
  isRunning,
  hasErrors,
  isInactive,
  compact,
  className,
}) => {
  const statusKey = getStatus({ isDraft, isPublished, isRunning, hasErrors, isInactive });
  const status = STATUS_CONFIG[statusKey];

  if (!status) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-island-sm border-0 font-medium uppercase tracking-wide shadow-island-sm",
        compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
        status.bgColor,
        status.textColor,
        className
      )}
      data-testid="header-status"
    >
      <span
        className={cn(
          "rounded-full",
          compact ? "h-1.5 w-1.5" : "h-2 w-2",
          status.dotColor,
          status.animate && "animate-pulse"
        )}
      />
      {status.label}
    </Badge>
  );
};

export default HeaderStatus;
