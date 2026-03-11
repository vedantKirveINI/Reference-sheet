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

const gtmPattern = /^GTM-[A-Z0-9]+$/i;

function GoogleTagManager({ gtmData, setGtmData, smartMode = false }, ref) {
  const containerId = gtmData?.containerId || "";
  const isEnabled = gtmData?.isEnabled || false;

  useEffect(() => {
    if (smartMode) {
      const hasValue = containerId.trim().length > 0;
      if (hasValue !== isEnabled) {
        setGtmData({ isEnabled: hasValue });
      }
    }
  }, [containerId, smartMode, isEnabled, setGtmData]);

  const containerIdError = useMemo(() => {
    if (smartMode) {
      if (!containerId.trim()) return "";
      if (!gtmPattern.test(containerId.trim()))
        return "Format: GTM-XXXXXXX";
      return "";
    }
    if (!isEnabled) return "";
    if (!containerId.trim()) return "Container ID is required";
    if (!gtmPattern.test(containerId.trim()))
      return "Expected format like GTM-XXXXXXX";
    return "";
  }, [gtmData, smartMode, containerId, isEnabled]);

  const handleEnabledChange = (checked) => {
    setGtmData({ isEnabled: checked });
  };

  const handleContainerIdChange = (e) => {
    setGtmData({ containerId: e.target.value });
  };

  if (smartMode) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="gtm-container-id" className="text-sm font-medium text-foreground">
          Google Tag Manager
        </Label>
        <Input
          id="gtm-container-id"
          name="containerId"
          type="text"
          placeholder="GTM-XXXXXXX"
          value={containerId}
          onChange={handleContainerIdChange}
          className={cn(
            "font-mono text-sm h-9",
            containerIdError && "border-destructive focus-visible:ring-destructive"
          )}
          aria-invalid={Boolean(containerIdError)}
        />
        {containerIdError && (
          <p className="text-xs text-destructive">{containerIdError}</p>
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
            Enable Google Tag Manager
          </Label>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              When enabled, the GTM snippet will use your Container ID to send events
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
            htmlFor="gtm-container-id"
            className="text-sm font-medium text-foreground"
          >
            Container ID
          </Label>
          <Input
            id="gtm-container-id"
            name="containerId"
            type="text"
            placeholder="GTM-XXXXXXX"
            value={containerId}
            onChange={handleContainerIdChange}
            disabled={!isEnabled}
            className={cn(
              "font-mono",
              containerIdError && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={Boolean(containerIdError)}
            aria-describedby={
              containerIdError ? "gtm-container-id-error" : undefined
            }
          />
          {containerIdError && (
            <p id="gtm-container-id-error" className="text-xs text-destructive">
              {containerIdError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default forwardRef(GoogleTagManager);
