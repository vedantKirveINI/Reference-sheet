import React, { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const KeyValueGrid = ({
  data,
  columns = 2,
  showCopy = true,
  emptyMessage = "No data",
  className,
}) => {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = useCallback(async (key, value, e) => {
    e?.stopPropagation();
    try {
      const textValue = typeof value === "object"
        ? JSON.stringify(value, null, 2)
        : String(value);
      await navigator.clipboard.writeText(textValue);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">—</span>;
    }
    if (typeof value === "boolean") {
      return (
        <span className={value ? "text-emerald-600" : "text-red-500"}>
          {String(value)}
        </span>
      );
    }
    if (typeof value === "number") {
      return <span className="font-mono text-blue-600">{value}</span>;
    }
    if (typeof value === "object") {
      return (
        <span className="font-mono text-muted-foreground text-xs break-all break-words">
          {JSON.stringify(value).slice(0, 30)}...
        </span>
      );
    }
    const str = String(value);
    return <span className="break-all break-words">{str}</span>;
  };

  const entries = Object.entries(data || {});

  if (entries.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3 min-w-0",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {entries.map(([key, value]) => (
        <div
          key={key}
          className={cn(
            "group flex items-start justify-between gap-2 p-3 rounded-lg min-w-0",
            "bg-muted/30 hover:bg-muted/50 transition-colors"
          )}
        >
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-xs text-muted-foreground mb-1 truncate" title={key}>
              {key}
            </p>
            <p className="text-sm text-foreground break-all min-w-0" title={typeof value === "object" ? JSON.stringify(value) : String(value)}>
              {formatValue(value)}
            </p>
          </div>
          {showCopy && value !== null && value !== undefined && (
            <button
              onClick={(e) => handleCopy(key, value, e)}
              className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-background text-muted-foreground hover:text-foreground"
              )}
              title="Copy value"
            >
              {copiedKey === key ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default KeyValueGrid;
