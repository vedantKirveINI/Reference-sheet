import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const TAB_HINTS = {
  initialise: "Select your connection or add a new one",
  connect: "Select your connection or add a new one",
  connection: "Select your connection or add a new one",
  configure: "Fill in the required fields, then save and continue",
  config: "Fill in the required fields, then save and continue",
  test: "Test this step, or save and move on",
  run: "Test this step, or save and move on",
};

const AI_CONFIGURE_HINT = "Review the AI-suggested settings below, then save and continue";

function getHintForTab(activeTab, hasAIConfig) {
  if (!activeTab) return "Configure this node and save when ready";
  const key = String(activeTab).toLowerCase().trim();
  if ((key === "configure" || key === "config") && hasAIConfig) {
    return AI_CONFIGURE_HINT;
  }
  return TAB_HINTS[key] || "Configure this node and save when ready";
}

const GuidedDrawerBanner = ({
  nodeData,
  stepNumber,
  totalSteps,
  activeTab,
  hasAIConfig,
  onBackToOverview,
  onSaveAndNext,
}) => {
  const nodeName = nodeData?.name || nodeData?.text || "this step";
  const hint = getHintForTab(activeTab, hasAIConfig);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex items-center justify-between gap-3",
        "px-4 py-3",
        "bg-gradient-to-r from-[#1C3693]/[0.08] to-[#1C3693]/[0.03]",
        "border-b-2 border-[#1C3693]/20",
        "shrink-0"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onBackToOverview}
          className={cn(
            "flex items-center gap-0.5 px-1.5 py-1 rounded-md",
            "text-[11px] font-medium text-[#1C3693]/60",
            "hover:text-[#1C3693] hover:bg-[#1C3693]/[0.06]",
            "transition-colors duration-150"
          )}
          title="Back to Overview"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-bold text-[#1C3693] uppercase tracking-wider whitespace-nowrap">
            Step {stepNumber}/{totalSteps}
          </span>

          <div className="w-px h-4 bg-[#1C3693]/15" />

          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-[#1C3693]/50 shrink-0" />
            <span className="text-[12px] text-[#1C3693]/80 font-medium truncate">
              {hint}
            </span>
          </div>
        </div>
      </div>

      {onSaveAndNext && (
        <button
          onClick={onSaveAndNext}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg",
            "bg-[#1C3693] text-white",
            "text-[12px] font-semibold",
            "hover:bg-[#1C3693]/90 active:bg-[#1C3693]/80",
            "transition-colors duration-150",
            "whitespace-nowrap shrink-0",
            "shadow-sm"
          )}
        >
          Save & Next Node
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
};

export default GuidedDrawerBanner;
