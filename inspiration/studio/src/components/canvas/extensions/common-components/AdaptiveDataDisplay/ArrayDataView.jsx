import React, { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Copy, Check, Table, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { humanizeKey } from "./utils";
import FlatDataTable from "./FlatDataTable";
import { TruncatedValueWithPopover } from "./TruncatedValueWithPopover";

const ArrayDataView = ({ 
  data, 
  title,
  accentColor = "#3b82f6",
  className 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState("card");
  const [copiedKey, setCopiedKey] = useState(null);

  const columns = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const allKeys = new Set();
    data.forEach(item => {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });
    return Array.from(allKeys);
  }, [data]);

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

  const renderCellValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">—</span>;
    }
    if (typeof value === "boolean") {
      return (
        <span className={cn(
          "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium",
          value ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
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
          <pre className="font-mono text-xs whitespace-pre-wrap break-all text-foreground bg-muted/20 rounded-lg border border-border/30 p-2 max-h-32 overflow-auto">
            {json}
          </pre>
        );
      } catch {
        return <span className="text-muted-foreground italic text-xs">[value]</span>;
      }
    }
    const strValue = String(value);
    if (strValue.length > 80) {
      return (
        <TruncatedValueWithPopover
          value={strValue}
          maxLength={80}
          showQuotes={false}
          label="Full value"
          className="text-foreground text-sm"
        />
      );
    }
    return <span className="text-foreground">{strValue}</span>;
  };

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className={cn("text-muted-foreground text-sm italic p-4", className)}>
        No items
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      {title && (
        <div 
          className="px-4 py-2.5 border-b font-medium text-sm flex items-center justify-between"
          style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
        >
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {data.length} {data.length === 1 ? "item" : "items"}
            </span>
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("card")}
                className={cn(
                  "p-1.5 transition-colors",
                  viewMode === "card" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
                title="Card view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 transition-colors",
                  viewMode === "table" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
                title="Table view"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "card" ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className={cn(
                "p-1.5 rounded-md border transition-colors",
                currentIndex === 0 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-muted"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {data.length}
            </span>
            <button
              onClick={() => setCurrentIndex(Math.min(data.length - 1, currentIndex + 1))}
              disabled={currentIndex === data.length - 1}
              className={cn(
                "p-1.5 rounded-md border transition-colors",
                currentIndex === data.length - 1 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-muted"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <FlatDataTable 
            data={data[currentIndex]} 
            accentColor={accentColor}
          />

          {data.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {data.slice(0, Math.min(7, data.length)).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx === currentIndex 
                      ? "bg-primary" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
              {data.length > 7 && (
                <span className="text-xs text-muted-foreground ml-1">...</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map(col => (
                  <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground">
                    {humanizeKey(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-muted/30 transition-colors">
                  {columns.map(col => (
                    <td key={col} className="px-3 py-2 group">
                      <div className="flex items-center gap-2">
                        <span className="flex-1 truncate">
                          {renderCellValue(row?.[col])}
                        </span>
                        <button
                          onClick={() => handleCopy(row?.[col], `${rowIdx}-${col}`)}
                          className={cn(
                            "p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                            "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {copiedKey === `${rowIdx}-${col}` ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArrayDataView;
