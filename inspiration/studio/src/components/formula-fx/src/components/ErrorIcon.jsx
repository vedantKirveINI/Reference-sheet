import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { SEVERITY_LEVELS } from "../utils/type-inference.js";

/**
 * ErrorIcon component displays an error or warning icon with a tooltip showing the error message.
 * 
 * @param {Object} props
 * @param {string} [props.errorMessage] - The error message to display in the tooltip
 * @param {boolean} [props.hasError=false] - Whether an external error exists
 * @param {string} [props.messageSeverity] - The severity level (from SEVERITY_LEVELS)
 * @param {number} [props.delayDuration=300] - Tooltip delay duration in milliseconds
 * @param {string} [props.side="top"] - Tooltip side placement
 * @param {number} [props.sideOffset=6] - Tooltip side offset in pixels
 * @param {string} [props.className] - Additional CSS classes for the icon container
 */
const ErrorIcon = ({
  errorMessage,
  hasError = false,
  messageSeverity = SEVERITY_LEVELS.NONE,
  delayDuration = 300,
  side = "top",
  sideOffset = 6,
  className = "",
}) => {

  // Determine effective severity: errorMessage takes precedence, then hasError defaults to ERROR
  const effectiveSeverity =
    messageSeverity !== SEVERITY_LEVELS.NONE
      ? messageSeverity
      : hasError
        ? SEVERITY_LEVELS.ERROR
        : SEVERITY_LEVELS.NONE;

  // Don't render if there's no error
  if (effectiveSeverity === SEVERITY_LEVELS.NONE && !errorMessage && !hasError) {
    return null;
  }

  const isWarning = effectiveSeverity === SEVERITY_LEVELS.WARNING;
  const tooltipMessage = errorMessage || "An error occurred";

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center ${className}`}
            aria-label={errorMessage || hasError ? "Error details" : undefined}
          >
            {isWarning ? (
              <AlertTriangle className="h-4 w-4 text-amber-600 transition-colors hover:text-amber-700" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive transition-colors hover:text-destructive/80" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} sideOffset={sideOffset} className="max-w-xs">
          {tooltipMessage}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ErrorIcon;

