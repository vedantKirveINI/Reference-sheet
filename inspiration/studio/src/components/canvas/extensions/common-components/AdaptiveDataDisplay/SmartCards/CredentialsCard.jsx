import React, { useState, useCallback } from "react";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { humanizeKey, isArrayOfObjects } from "../utils";

const Key = icons.keyRound;
const Eye = icons.eye;
const EyeOff = icons.eyeOff;
const Copy = icons.copy;
const Check = icons.check;

const formatForCopy = (value) => {
  if (value === null || value === undefined) return String(value);
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const CredentialsArrayOfObjectsBlock = ({ value }) => {
  const [copiedField, setCopiedField] = useState(null);
  const handleCopyField = useCallback(async (itemIndex, key, fieldValue) => {
    try {
      await navigator.clipboard.writeText(formatForCopy(fieldValue));
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
                      <ValueDisplay value={v} suppressBlockCopy />
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

const CredentialsJsonBlockWithCopy = ({ value, suppressBlockCopy = false }) => {
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
      <div className="relative group/json mt-1">
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

const ValueDisplay = ({ value, suppressBlockCopy = false }) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic text-sm">{String(value)}</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={cn(
        "inline-flex px-2 py-0.5 rounded text-xs font-medium",
        value ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
      )}>
        {String(value)}
      </span>
    );
  }
  if (typeof value === "number") {
    return <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{value}</span>;
  }
  if (typeof value === "string") {
    return <span className="font-mono text-sm text-foreground break-all">{value}</span>;
  }
  if (isArrayOfObjects(value)) {
    return (
      <CredentialsArrayOfObjectsBlock value={value} />
    );
  }
  if (typeof value === "object") {
    try {
      return <CredentialsJsonBlockWithCopy value={value} suppressBlockCopy={suppressBlockCopy} />;
    } catch {
      return <span className="text-muted-foreground italic text-sm">[value]</span>;
    }
  }
  return <span className="text-sm text-foreground">{String(value)}</span>;
};

const MaskedValue = ({ value, revealed, suppressBlockCopy = false }) => {
  if (revealed) {
    return <ValueDisplay value={value} suppressBlockCopy={suppressBlockCopy} />;
  }
  const str = formatForCopy(value);
  const len = Math.min(str.length, 20);
  return <span className="font-mono text-sm tracking-wider">{"•".repeat(len)}</span>;
};

const CredentialsCard = ({ data, label, accentColor = "#3b82f6" }) => {
  const [revealed, setRevealed] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  
  const { fields } = data;
  const { sensitive = {}, regular = {} } = fields || {};
  
  const handleCopy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(formatForCopy(value));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {}
  };
  
  const hasContent = Object.keys(sensitive).length > 0 || Object.keys(regular).length > 0;
  
  if (!hasContent) {
    return null;
  }

  return (
    <div className="rounded-xl bg-background border border-border/50 shadow-sm overflow-hidden">
      <div 
        className="px-4 py-2.5 border-b border-border/30 flex items-center justify-between"
        style={{ backgroundColor: `${accentColor}08` }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Key 
              className="w-4 h-4" 
              style={{ color: accentColor }} 
            />
          </div>
          <span className="text-sm font-medium text-foreground">{label || "Credentials"}</span>
        </div>
        
        {Object.keys(sensitive).length > 0 && (
          <button
            onClick={() => setRevealed(!revealed)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
          >
            {revealed ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="divide-y divide-border/30">
        {Object.entries(regular).map(([key, value]) => {
          const isObjectOrArray = value !== null && typeof value === "object";
          return (
            <div key={key} className="px-4 py-3 flex items-start justify-between gap-4 group/credrow">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">{humanizeKey(key)}</p>
                <ValueDisplay value={value} suppressBlockCopy />
              </div>
              <button
                type="button"
                onClick={() => handleCopy(key, value)}
                title={copiedKey === key ? "Copied" : "Copy value"}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0",
                  copiedKey === key ? "text-green-600 dark:text-green-400 bg-green-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isObjectOrArray ? "opacity-100" : "opacity-0 group-hover/credrow:opacity-100"
                )}
              >
                {copiedKey === key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
        
        {Object.entries(sensitive).map(([key, value]) => {
          const isObjectOrArray = value !== null && typeof value === "object";
          return (
            <div key={key} className="px-4 py-3 flex items-center justify-between gap-4 group/credrow bg-amber-500/5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-xs text-muted-foreground">{humanizeKey(key)}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                    SENSITIVE
                  </span>
                </div>
                <div className="text-foreground">
                  <MaskedValue value={value} revealed={revealed} suppressBlockCopy />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(key, value)}
                title={copiedKey === key ? "Copied" : "Copy value"}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0",
                  copiedKey === key ? "text-green-600 dark:text-green-400 bg-green-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isObjectOrArray ? "opacity-100" : "opacity-0 group-hover/credrow:opacity-100"
                )}
              >
                {copiedKey === key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CredentialsCard;
