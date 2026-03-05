import React, { useState, useCallback } from "react";
import { Copy, Check, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const FieldValueRow = ({
  label,
  value,
  type = "text",
  icon: Icon,
  copyable = true,
  truncate = true,
  monospace = false,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    try {
      const textValue = typeof value === "object" 
        ? JSON.stringify(value, null, 2) 
        : String(value);
      await navigator.clipboard.writeText(textValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, [value]);

  const renderValue = () => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic text-sm">—</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span className={cn(
          "text-sm font-medium",
          value ? "text-emerald-600" : "text-red-500"
        )}>
          {String(value)}
        </span>
      );
    }

    if (typeof value === "number") {
      return (
        <span className="text-sm font-mono text-blue-600">
          {value}
        </span>
      );
    }

    if (typeof value === "object") {
      return (
        <span className="text-sm font-mono text-muted-foreground">
          {JSON.stringify(value).slice(0, 50)}...
        </span>
      );
    }

    const stringValue = String(value);
    const isUrl = stringValue.startsWith("http://") || stringValue.startsWith("https://");

    if (isUrl) {
      return (
        <a 
          href={stringValue} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 break-all break-words min-w-0"
        >
          <span className="break-all break-words min-w-0">
            {truncate && stringValue.length > 40 
              ? stringValue.slice(0, 40) + "..." 
              : stringValue}
          </span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      );
    }

    return (
      <span 
        className={cn(
          "text-sm text-foreground block min-w-0",
          monospace && "font-mono",
          truncate ? "truncate" : "break-all break-words"
        )}
        title={truncate ? stringValue : undefined}
      >
        {stringValue}
      </span>
    );
  };

  return (
    <div 
      className={cn(
        "group flex items-start gap-3 py-2.5 px-3 -mx-3 rounded-lg",
        "hover:bg-muted/30 transition-colors",
        className
      )}
    >
      {Icon && (
        <div className="w-7 h-7 rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            {renderValue()}
          </div>
          {copyable && value !== null && value !== undefined && (
            <button
              onClick={handleCopy}
              className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              title="Copy value"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldValueRow;
