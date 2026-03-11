import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const formatData = (data) => {
  if (data === null || data === undefined) return null;
  if (typeof data === "object") {
    return JSON.stringify(data, null, 2);
  }
  return String(data);
};

const DataSection = ({
  label,
  data,
  emptyText = "No data",
  defaultOpen = false,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isError = variant === "error";
  const formatted = formatData(data);
  const displayText = formatted ?? emptyText;

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        isError ? "bg-red-50/80" : "bg-zinc-50",
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors",
          isError
            ? "hover:bg-red-100/60"
            : "hover:bg-zinc-100/80",
        )}
      >
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
            isError ? "text-red-400" : "text-zinc-400",
          )}
        />
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            isError ? "text-red-600" : "text-zinc-500",
          )}
        >
          {label}
        </span>
        {isError && (
          <span className="ml-auto w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "px-3 pb-3",
            isError && "border-l-2 border-red-400 ml-3",
          )}
        >
          <pre
            className={cn(
              "text-xs font-mono whitespace-pre-wrap break-words p-3 rounded-lg overflow-auto max-h-[200px] select-text",
              isError
                ? "bg-red-100/60 text-red-800"
                : "bg-white text-zinc-700 ring-1 ring-zinc-200/60",
            )}
          >
            {displayText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DataSection;
