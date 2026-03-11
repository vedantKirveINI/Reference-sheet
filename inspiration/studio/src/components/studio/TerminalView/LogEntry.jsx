import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const LEVEL_COLORS = {
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  debug: "text-gray-400",
  success: "text-green-400",
};

const LEVEL_BADGES = {
  info: "bg-blue-500/20 text-blue-400",
  warn: "bg-yellow-500/20 text-yellow-400",
  error: "bg-red-500/20 text-red-400",
  debug: "bg-gray-500/20 text-gray-400",
  success: "bg-green-500/20 text-green-400",
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LogEntry({ log }) {
  const [isOpen, setIsOpen] = useState(false);
  const { timestamp, level, message, data } = log;
  const hasData = data && typeof data === "object" && Object.keys(data).length > 0;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-2 hover:bg-gray-800/50 transition-colors",
        "border-b border-gray-800/50 last:border-b-0"
      )}
    >
      <span className="text-gray-500 font-mono text-xs shrink-0 pt-0.5">
        {formatTimestamp(timestamp)}
      </span>

      <span
        className={cn(
          "text-xs font-medium uppercase px-1.5 py-0.5 rounded shrink-0",
          LEVEL_BADGES[level] || LEVEL_BADGES.info
        )}
      >
        {level}
      </span>

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "font-mono text-sm break-words",
            LEVEL_COLORS[level] || LEVEL_COLORS.info
          )}
        >
          {message}
        </span>

        {hasData && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors cursor-pointer">
              {isOpen ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              <span>{isOpen ? "Hide data" : "Show data"}</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-2 p-3 bg-gray-800 rounded-lg text-xs font-mono text-gray-300 overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
