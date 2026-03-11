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

const pixelIdPattern = /^\d{15,16}$/;

function MetaPixel({ metaPixelData, setMetaPixelData, smartMode = false }, ref) {
  const pixelId = metaPixelData?.pixelId || "";
  const isEnabled = metaPixelData?.isEnabled || false;

  useEffect(() => {
    if (smartMode) {
      const hasValue = pixelId.trim().length > 0;
      if (hasValue !== isEnabled) {
        setMetaPixelData({ isEnabled: hasValue });
      }
    }
  }, [pixelId, smartMode, isEnabled, setMetaPixelData]);

  const pixelIdError = useMemo(() => {
    if (smartMode) {
      if (!pixelId.trim()) return "";
      if (!pixelIdPattern.test(pixelId.trim()))
        return "Format: 15-16 digits";
      return "";
    }
    if (!isEnabled) return "";
    if (!pixelId.trim()) return "Pixel ID is required";
    if (!pixelIdPattern.test(pixelId.trim()))
      return "Expected format: 15-16 digit number";
    return "";
  }, [metaPixelData, smartMode, pixelId, isEnabled]);

  const handleEnabledChange = (checked) => {
    setMetaPixelData({ isEnabled: checked });
  };

  const handlePixelIdChange = (e) => {
    setMetaPixelData({ pixelId: e.target.value });
  };

  if (smartMode) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="meta-pixel-id" className="text-sm font-medium text-foreground">
          Meta Pixel
        </Label>
        <Input
          id="meta-pixel-id"
          name="pixelId"
          type="text"
          placeholder="123456789012345"
          value={pixelId}
          onChange={handlePixelIdChange}
          className={cn(
            "font-mono text-sm h-9",
            pixelIdError && "border-destructive focus-visible:ring-destructive"
          )}
          aria-invalid={Boolean(pixelIdError)}
        />
        {pixelIdError && (
          <p className="text-xs text-destructive">{pixelIdError}</p>
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
            Enable Meta Pixel
          </Label>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              When enabled, Meta Pixel will track form submissions using the specified Pixel ID.
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
          <div className="flex items-center gap-1">
            <Label
              htmlFor="meta-pixel-id"
              className="text-sm font-medium text-foreground"
            >
              Pixel ID
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  Find your Pixel ID in Meta Events Manager
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="meta-pixel-id"
            name="pixelId"
            type="text"
            placeholder="123456789012345"
            value={pixelId}
            onChange={handlePixelIdChange}
            disabled={!isEnabled}
            className={cn(
              "font-mono",
              pixelIdError && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={Boolean(pixelIdError)}
            aria-describedby={pixelIdError ? "meta-pixel-id-error" : undefined}
          />
          {pixelIdError && (
            <p id="meta-pixel-id-error" className="text-xs text-destructive">
              {pixelIdError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default forwardRef(MetaPixel);
