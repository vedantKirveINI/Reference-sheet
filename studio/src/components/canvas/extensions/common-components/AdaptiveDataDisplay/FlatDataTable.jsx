import React, { useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { humanizeKey } from "./utils";
import { TruncatedValueWithPopover } from "./TruncatedValueWithPopover";

const FlatDataTable = ({ data, title, accentColor = "#3b82f6", className }) => {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = useCallback(async (value, key) => {
    try {
      const textValue = typeof value === "object" 
        ? JSON.stringify(value, null, 2) 
        : String(value ?? "");
      await navigator.clipboard.writeText(textValue);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, []);

  const renderValue = (value) => {
    if (value === null) return <span className="text-muted-foreground italic">null</span>;
    if (value === undefined) return <span className="text-muted-foreground italic">—</span>;
    if (typeof value === "boolean") {
      return (
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
          value ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {String(value)}
        </span>
      );
    }
    if (typeof value === "number") {
      return <span className="font-mono text-blue-600 dark:text-blue-400">{value}</span>;
    }
    if (typeof value === "object") {
      try {
        const json = JSON.stringify(value, null, 2);
        return (
          <pre className="font-mono text-xs whitespace-pre-wrap break-all text-foreground bg-muted/20 rounded-lg border border-border/30 p-2.5 max-h-36 overflow-auto">
            {json}
          </pre>
        );
      } catch {
        return <span className="text-muted-foreground italic">[value]</span>;
      }
    }
    const str = String(value);
    if (str.length > 100) {
      return (
        <TruncatedValueWithPopover
          value={str}
          maxLength={100}
          showQuotes={false}
          label="Full value"
          className="text-foreground text-sm"
        />
      );
    }
    return <span className="text-foreground break-words">{str}</span>;
  };

  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return (
      <div className={cn("text-muted-foreground text-sm italic p-4", className)}>
        No data available
      </div>
    );
  }

  const entries = Object.entries(data);

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {title && (
        <div 
          className="px-4 py-2.5 border-b font-medium text-sm"
          style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
        >
          {title}
        </div>
      )}
      <div className="divide-y">
        {entries.map(([key, value]) => (
          <div 
            key={key} 
            className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex-1 min-w-0 pr-4">
              <div className="text-sm font-medium text-muted-foreground mb-0.5">
                {humanizeKey(key)}
              </div>
              <div className="text-sm break-words">
                {renderValue(value)}
              </div>
            </div>
            <button
              onClick={() => handleCopy(value, key)}
              className={cn(
                "p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              title="Copy value"
            >
              {copiedKey === key ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlatDataTable;
