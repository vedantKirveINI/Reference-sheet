import React, { forwardRef, useMemo, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ga4Pattern = /^G-[A-Z0-9]+$/i;
const uaPattern = /^UA-\d{4,10}-\d{1,4}$/i;

function GoogleAnalytics({ gaData, setGaData, smartMode = false }, ref) {
  const measurementId = gaData?.measurementId || "";
  const isEnabled = gaData?.isEnabled || false;

  useEffect(() => {
    if (smartMode) {
      const hasValue = measurementId.trim().length > 0;
      if (hasValue !== isEnabled) {
        setGaData({ isEnabled: hasValue });
      }
    }
  }, [measurementId, smartMode, isEnabled, setGaData]);

  const measurementIdError = useMemo(() => {
    if (smartMode) {
      if (!measurementId.trim()) return "";
      if (!ga4Pattern.test(measurementId.trim()) && !uaPattern.test(measurementId.trim())) {
        return "Format: G-XXXXXXXXXX";
      }
      return "";
    }
    if (!isEnabled) return "";
    if (!measurementId.trim()) return "Measurement ID is required";
    if (!ga4Pattern.test(measurementId.trim()) && !uaPattern.test(measurementId.trim())) {
      return "Expected format: G-XXXXXXXXXX (GA4) or UA-XXXXXX-XX (Universal)";
    }
    return "";
  }, [gaData, smartMode, measurementId, isEnabled]);

  const handleEnabledChange = (checked) => {
    setGaData({ isEnabled: checked });
  };

  const handleMeasurementIdChange = (e) => {
    setGaData({ measurementId: e.target.value });
  };

  if (smartMode) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="ga-measurement-id" className="text-sm font-medium text-foreground">
          Google Analytics
        </Label>
        <Input
          id="ga-measurement-id"
          name="measurementId"
          type="text"
          placeholder="G-XXXXXXXXXX"
          value={measurementId}
          onChange={handleMeasurementIdChange}
          className={cn(
            "font-mono text-sm h-9",
            measurementIdError && "border-destructive focus-visible:ring-destructive"
          )}
          aria-invalid={Boolean(measurementIdError)}
        />
        {measurementIdError && (
          <p className="text-xs text-destructive">{measurementIdError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={isEnabled}
            onCheckedChange={handleEnabledChange}
          />
          <Label className="text-sm font-medium cursor-pointer text-foreground">
            Enable Google Analytics
          </Label>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              When enabled, Google Analytics will send events to the specified Measurement ID.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div
        className={cn(
          "space-y-2 transition-opacity",
          !isEnabled && "opacity-50 pointer-events-none"
        )}
      >
        <div className="space-y-1.5">
          <Label
            htmlFor="ga-measurement-id"
            className="text-sm font-medium text-foreground"
          >
            Measurement ID
          </Label>
          <Input
            id="ga-measurement-id"
            name="measurementId"
            type="text"
            placeholder="G-XXXXXXXXXX or UA-XXXXXX-XX"
            value={measurementId}
            onChange={handleMeasurementIdChange}
            disabled={!isEnabled}
            className={cn(
              "font-mono",
              measurementIdError && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={Boolean(measurementIdError)}
            aria-describedby={
              measurementIdError ? "ga-measurement-id-error" : undefined
            }
          />
          {measurementIdError && (
            <p id="ga-measurement-id-error" className="text-xs text-destructive">
              {measurementIdError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default forwardRef(GoogleAnalytics);
