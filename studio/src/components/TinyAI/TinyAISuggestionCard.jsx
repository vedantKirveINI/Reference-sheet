import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Plus, X } from "lucide-react";

const TinyAISuggestionCard = ({ suggestion, onNodeAdd, onDismiss, onMute }) => {
  if (!suggestion || !suggestion.nodes?.length) return null;

  return (
    <div
      className={cn(
        "rounded-island-sm shadow-island-sm",
        "border border-emerald-200/60 bg-gradient-to-r from-emerald-50/50 to-white",
        "px-3.5 py-3",
        "mb-1",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[12px] font-semibold text-slate-800">Suggested next step</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onDismiss}
            className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onMute}
            className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors px-1"
            title="Stop suggestions for this workflow"
          >
            Mute
          </button>
        </div>
      </div>

      <p className="text-[12px] leading-[1.5] text-slate-600 mb-2.5">
        {suggestion.summary}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {suggestion.nodes.map((node, idx) => (
          <button
            key={`suggestion-card-${node.type || idx}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onNodeAdd?.(node);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5",
              "rounded-lg bg-white border border-emerald-200",
              "text-[12px] font-medium text-slate-800",
              "hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-sm",
              "transition-all cursor-pointer whitespace-nowrap",
            )}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            {node.name || node.type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TinyAISuggestionCard;
