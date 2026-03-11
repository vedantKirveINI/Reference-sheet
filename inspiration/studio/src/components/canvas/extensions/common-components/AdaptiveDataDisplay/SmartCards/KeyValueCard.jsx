import React, { useState, useCallback } from "react";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { humanizeKey, isArrayOfObjects } from "../utils";

const List = icons.list;
const Copy = icons.copy;
const Check = icons.check;

const formatValueForCopy = (v) => {
  if (v === null || v === undefined) return String(v);
  if (typeof v === "object") {
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  }
  return String(v);
};

const ArrayOfObjectsBlockWithCopy = ({ value, suppressBlockCopy = false }) => {
  const [copiedField, setCopiedField] = useState(null);
  const handleCopyField = useCallback(async (itemIndex, key, fieldValue) => {
    try {
      await navigator.clipboard.writeText(formatValueForCopy(fieldValue));
      setCopiedField(`${itemIndex}-${key}`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {}
  }, []);
  return (
    <div className="mt-2 space-y-2">
      {value.map((item, index) => (
        <div
          key={index}
          className="rounded-lg border border-border/40 bg-muted/5 overflow-hidden"
        >
          <div className="divide-y divide-border/20">
            {Object.entries(item).map(([k, v]) => {
              const fieldId = `${index}-${k}`;
              const isCopied = copiedField === fieldId;
              return (
                <div key={k} className="group/nestedrow px-3 py-2 flex items-start justify-between gap-3 hover:bg-muted/10 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">{humanizeKey(k)}</p>
                    <div className="text-sm">
                      <ValueRenderer value={v} suppressBlockCopy />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyField(index, k, v)}
                    title={isCopied ? "Copied" : `Copy ${humanizeKey(k)}`}
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-md transition-all flex-shrink-0",
                      isCopied
                        ? "text-green-600 bg-green-500/10 opacity-100"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 opacity-0 group-hover/nestedrow:opacity-100"
                    )}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const JsonBlockWithCopy = ({ value, className = "", suppressBlockCopy = false }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      const text = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  }, [value]);
  try {
    const json = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    return (
      <div className={cn("relative group/json mt-1", className)}>
        <pre className={cn(
          "font-mono text-xs whitespace-pre-wrap break-all text-foreground rounded-lg border border-border/30 p-3 max-h-40 overflow-auto",
          suppressBlockCopy ? "bg-muted/10" : "bg-muted/20 pr-10"
        )}>
          {json}
        </pre>
        {!suppressBlockCopy && (
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied" : "Copy"}
            className={cn(
              "absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all",
              copied ? "text-green-600 bg-green-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    );
  } catch {
    return <span className="text-muted-foreground italic text-sm">[value]</span>;
  }
};

const ValueRenderer = ({ value, suppressBlockCopy = false }) => {
  if (value === null) {
    return <span className="text-muted-foreground italic">null</span>;
  }
  if (value === undefined) {
    return <span className="text-muted-foreground italic">undefined</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={cn(
        "inline-flex px-2 py-0.5 rounded-md text-xs font-medium",
        value 
          ? "bg-green-500/10 text-green-600 dark:text-green-400" 
          : "bg-red-500/10 text-red-600 dark:text-red-400"
      )}>
        {String(value)}
      </span>
    );
  }
  if (typeof value === "number") {
    return <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{value}</span>;
  }
  if (typeof value === "string") {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-mono text-sm text-primary hover:underline truncate block max-w-full"
        >
          {value}
        </a>
      );
    }
    return <span className="text-foreground break-words">{value}</span>;
  }
  if (isArrayOfObjects(value)) {
    return (
      <ArrayOfObjectsBlockWithCopy value={value} suppressBlockCopy={suppressBlockCopy} />
    );
  }
  if (typeof value === "object") {
    return <JsonBlockWithCopy value={value} suppressBlockCopy={suppressBlockCopy} />;
  }
  return <span className="text-foreground">{String(value)}</span>;
};

const KeyValueCard = ({ data, label, accentColor = "#3b82f6", showHeader = true, inputStyle = false }) => {
  const [copiedKey, setCopiedKey] = useState(null);
  
  const entries = data?.originalData 
    ? Object.entries(data.originalData) 
    : (typeof data === 'object' && data !== null ? Object.entries(data) : []);
  
  const handleCopy = useCallback(async (key, value) => {
    try {
      const textValue = typeof value === "object" 
        ? JSON.stringify(value, null, 2) 
        : String(value);
      await navigator.clipboard.writeText(textValue);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {}
  }, []);
  
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-card border border-border/60 shadow-sm overflow-hidden">
      {showHeader && label && (
        <div 
          className="px-4 py-3 border-b border-border/40 flex items-center gap-3"
          style={{ backgroundColor: `${accentColor}0c` }}
        >
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}18` }}
          >
            <List 
              className="w-4 h-4" 
              style={{ color: accentColor }} 
            />
          </div>
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground ml-auto tabular-nums">
            {entries.length} {entries.length === 1 ? "field" : "fields"}
          </span>
        </div>
      )}
      
      <div className="divide-y divide-border/20">
        {entries.map(([key, value]) => {
          const isObjectOrArray = value !== null && typeof value === "object";
          return (
            <div
              key={key}
              className={cn(
                "px-4 py-3 flex items-start justify-between gap-4 group/kvrow transition-colors",
                inputStyle ? "hover:bg-muted/5" : "hover:bg-muted/10"
              )}
            >
              {inputStyle ? (
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5" title={key}>
                    {humanizeKey(key)}
                  </p>
                  <div className="text-sm min-w-0 min-h-[1.5rem]">
                    <ValueRenderer value={value} suppressBlockCopy />
                  </div>
                </div>
              ) : (
                <div className="min-w-0 flex-1 grid grid-cols-[140px,1fr] gap-4 items-start">
                  <p className="text-sm text-muted-foreground font-medium truncate" title={key}>
                    {humanizeKey(key)}
                  </p>
                  <div className="text-sm min-w-0 min-h-[1.5rem]">
                    <ValueRenderer value={value} suppressBlockCopy />
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleCopy(key, value)}
                title={copiedKey === key ? "Copied" : "Copy value"}
                className={cn(
                  "flex items-center justify-center rounded-lg transition-all flex-shrink-0",
                  inputStyle ? "w-8 h-8" : "gap-1.5 px-2.5 py-1.5 min-w-[2rem]",
                  copiedKey === key
                    ? "text-green-600 dark:text-green-400 bg-green-500/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isObjectOrArray ? "opacity-100" : "opacity-0 group-hover/kvrow:opacity-100"
                )}
              >
                {copiedKey === key ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {!inputStyle && (
                  <>
                    {copiedKey === key ? <span className="text-xs font-medium">Copied</span> : <span className="text-xs font-medium">Copy</span>}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeyValueCard;
