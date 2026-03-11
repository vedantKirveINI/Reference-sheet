import React, { forwardRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FileText, Database, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

dayjs.extend(relativeTime);

export const VersionCard = forwardRef(function VersionCard({
  type,
  selected,
  nodeCount,
  timestamp,
  savedNodeCount,
  onClick,
  onKeyDown,
  tabIndex = 0,
  className,
  compact = false,
}, ref) {
  const isDraft = type === "draft";
  const Icon = isDraft ? FileText : Database;
  const title = isDraft ? "Draft" : "Saved Version";
  const timeAgo = timestamp
    ? dayjs(timestamp).fromNow()
    : "Unknown";

  const nodeDelta = isDraft && savedNodeCount !== undefined
    ? nodeCount - savedNodeCount
    : 0;

  if (compact) {
    return (
      <div
        ref={ref}
        role="radio"
        aria-checked={selected}
        tabIndex={tabIndex}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={cn(
          "relative flex flex-col gap-2 p-3 rounded-xl cursor-pointer transition-all duration-150",
          "bg-zinc-50 border",
          "hover:bg-zinc-100 hover:border-zinc-300",
          "focus:outline-none focus:ring-2 focus:ring-[#1C3693]/20 focus:ring-offset-1",
          selected
            ? "bg-white border-zinc-900 border-2 shadow-sm"
            : "border-zinc-200",
          className
        )}
        style={{ fontFamily: "Archivo, sans-serif" }}
        data-testid={`version-card-${type}`}
      >
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "w-4 h-4",
              isDraft ? "text-zinc-700" : "text-zinc-500"
            )}
          />
          <span className="font-medium text-sm text-zinc-800">{title}</span>
          {selected && (
            <svg className="w-4 h-4 ml-auto text-zinc-900" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="8" fill="currentColor"/>
              <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{nodeCount} nodes</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        "relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all duration-150",
        "bg-white border",
        "hover:bg-[#fafbfc] hover:border-[#b0bec5] hover:shadow-md hover:-translate-y-0.5",
        "focus:outline-none focus:ring-2 focus:ring-[#1C3693]/20 focus:ring-offset-2",
        selected
          ? "bg-[#eceff1] border-[#1C3693] border-2 shadow-md"
          : "border-[#cfd8dc]",
        className
      )}
      style={{ fontFamily: "Archivo, sans-serif" }}
      data-testid={`version-card-${type}`}
    >
      {selected && (
        <div className="absolute top-3 right-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="9" fill="#1C3693"/>
            <path d="M5.5 9L8 11.5L12.5 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            isDraft ? "bg-[#1C3693]/10" : "bg-[#f4f5f6]"
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5",
              isDraft ? "text-[#1C3693]" : "text-[#607d8b]"
            )}
          />
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="font-semibold text-[0.9375rem] text-[#263238] leading-tight">{title}</span>
          <span className="flex items-center gap-1 text-[0.8125rem] text-[#607d8b]">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#e8eaed]">
        <span className="text-[0.8125rem] text-[#607d8b]">
          <span className="font-semibold text-[#263238]">{nodeCount}</span> nodes
        </span>
        
        {isDraft && nodeDelta !== 0 && (
          <Badge
            variant="outline"
            className={cn(
              "text-[0.75rem] font-medium px-2 py-0.5",
              nodeDelta > 0
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-orange-200 bg-orange-50 text-orange-700"
            )}
          >
            {nodeDelta > 0 ? `+${nodeDelta}` : nodeDelta}
          </Badge>
        )}
      </div>
    </div>
  );
});

export default VersionCard;
