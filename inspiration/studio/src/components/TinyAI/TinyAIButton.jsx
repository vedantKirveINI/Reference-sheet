import React from "react";
import TooltipWrapper from "../tooltip-wrapper";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { TOOLTIP } from "./constants";

const TinyAIButton = ({ onClick, hasSuggestion = false }) => {
  return (
    <TooltipWrapper
      title={TOOLTIP}
      component="button"
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 h-10 px-3",
        "rounded-island-sm",
        "bg-gradient-to-r from-[#1C3693] to-[#4f6ce8]",
        "hover:from-[#2340a8] hover:to-[#5b7af0]",
        "text-white",
        "shadow-[0_2px_12px_rgba(28,54,147,0.25)]",
        "border border-white/20",
        "transition-all duration-200",
      )}
      data-testid="footer-tinyai-button"
    >
      <icons.sparkles className="w-4 h-4 text-white" />
      <span className="text-sm font-semibold">{TOOLTIP}</span>
      {hasSuggestion && (
        <span
          className={cn(
            "absolute -top-1 -right-1 w-3 h-3",
            "rounded-full bg-emerald-500 border-2 border-white",
            "animate-pulse",
          )}
        />
      )}
    </TooltipWrapper>
  );
};

export default TinyAIButton;
