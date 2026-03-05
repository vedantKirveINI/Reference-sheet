import React, { useState, useCallback } from "react";
import { ChevronDown, ChevronRight, Copy, Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTypeLabel, getTypeColor, humanizeKey } from "./utils";
import { TruncatedValueWithPopover, TRUNCATE_LENGTH, TRUNCATE_LENGTH_LINK } from "./TruncatedValueWithPopover";

const TypeBadge = ({ value }) => {
  const isArray = Array.isArray(value);
  const isObject = typeof value === "object" && value !== null;
  
  if (!isObject) return null;
  
  const count = isArray ? value.length : Object.keys(value).length;
  const label = isArray ? `${count} items` : `${count} keys`;
  
  return (
    <span className={cn(
      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
      isArray 
        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
        : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
    )}>
      {label}
    </span>
  );
};

const NestedDataTree = ({ 
  data, 
  title,
  accentColor = "#3b82f6", 
  searchQuery = "",
  defaultExpandDepth = 1,
  showCopyPath = true,
  className 
}) => {
  const [expandedPaths, setExpandedPaths] = useState({});
  const [copiedPath, setCopiedPath] = useState(null);
  const [copiedPathKey, setCopiedPathKey] = useState(null);

  const togglePath = useCallback((path) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: prev[path] === undefined ? false : !prev[path],
    }));
  }, []);

  const isExpanded = useCallback((path, depth) => {
    if (expandedPaths[path] !== undefined) return expandedPaths[path];
    return depth < defaultExpandDepth;
  }, [expandedPaths, defaultExpandDepth]);

  const handleCopy = useCallback(async (value, path) => {
    try {
      const textValue = typeof value === "object" 
        ? JSON.stringify(value, null, 2) 
        : String(value ?? "");
      await navigator.clipboard.writeText(textValue);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (e) {}
  }, []);

  const handleCopyPath = useCallback(async (path) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopiedPathKey(path);
      setTimeout(() => setCopiedPathKey(null), 2000);
    } catch (e) {}
  }, []);

  const matchesSearch = useCallback((key, value) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (String(key).toLowerCase().includes(query)) return true;
    if (typeof value === "string" && value.toLowerCase().includes(query)) return true;
    if (typeof value === "number" && String(value).includes(query)) return true;
    return false;
  }, [searchQuery]);

  const renderPrimitive = (value, path) => {
    if (value === null) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-muted-foreground italic font-mono text-xs">
          null
        </span>
      );
    }
    if (value === undefined) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-muted-foreground italic font-mono text-xs">
          undefined
        </span>
      );
    }
    if (typeof value === "boolean") {
      return (
        <span className={cn(
          "px-1.5 py-0.5 rounded font-mono text-xs font-medium",
          value 
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {String(value)}
        </span>
      );
    }
    if (typeof value === "number") {
      return (
        <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
          {value}
        </span>
      );
    }
    if (typeof value === "string") {
      const isLink = value.startsWith("http://") || value.startsWith("https://");
      const maxLen = isLink ? TRUNCATE_LENGTH_LINK : TRUNCATE_LENGTH;
      if (value.length > maxLen) {
        return (
          <TruncatedValueWithPopover
            value={value}
            maxLength={maxLen}
            asLink={isLink}
            label="Full value"
          />
        );
      }
      if (isLink) {
        return (
          <a 
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-primary hover:underline"
          >
            "{value}"
          </a>
        );
      }
      return (
        <span className="font-mono text-xs text-green-600 dark:text-green-400">
          "{value}"
        </span>
      );
    }
    if (typeof value === "object" && value !== null) {
      try {
        const json = JSON.stringify(value, null, 2);
        return (
          <pre className="font-mono text-xs whitespace-pre-wrap break-all text-foreground bg-muted/20 rounded-lg border border-border/30 p-2 max-h-32 max-w-full overflow-auto min-w-0">
            {json}
          </pre>
        );
      } catch {
        return <span className="font-mono text-xs text-muted-foreground">[value]</span>;
      }
    }
    return <span className="font-mono text-xs">{String(value)}</span>;
  };

  const renderNode = (key, value, path = "", depth = 0, isLast = false) => {
    const currentPath = path ? `${path}.${key}` : String(key);
    const isObject = typeof value === "object" && value !== null;
    const isArray = Array.isArray(value);
    const expanded = isExpanded(currentPath, depth);
    const matches = matchesSearch(key, value);

    if (searchQuery && !matches && !isObject) return null;

    const childEntries = isArray 
      ? value.map((item, index) => [index, item])
      : isObject 
        ? Object.entries(value)
        : [];

    return (
      <div key={currentPath} className="relative">
        {depth > 0 && (
          <div 
            className={cn(
              "absolute left-0 top-0 bottom-0 w-px",
              isLast ? "h-[14px]" : "h-full",
              "bg-border/60"
            )}
            style={{ left: -12 }}
          />
        )}
        {depth > 0 && (
          <div 
            className="absolute w-3 h-px bg-border/60"
            style={{ left: -12, top: 14 }}
          />
        )}
        
        <div 
          className={cn(
            "flex items-start gap-1.5 py-1 px-2 rounded-md group/row min-w-0",
            "hover:bg-muted/50 transition-colors",
            depth > 0 && "ml-4",
            searchQuery && matches && "bg-yellow-100/50 dark:bg-yellow-900/20"
          )}
        >
          {isObject ? (
            <button
              onClick={() => togglePath(currentPath)}
              className="p-0.5 hover:bg-muted rounded flex-shrink-0 mt-0.5"
            >
              {expanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-4 flex-shrink-0" />
          )}
          
          <div className="min-w-0 flex-1 overflow-hidden">
            <span className={cn(
              "text-sm font-medium flex-shrink-0",
              typeof key === "number" ? "text-orange-600 dark:text-orange-400" : "text-foreground"
            )}>
              {typeof key === "number" ? `[${key}]` : key}
            </span>
            
            {isObject ? (
              <TypeBadge value={value} />
            ) : (
              <>
                <span className="text-muted-foreground mx-0.5">:</span>
                {renderPrimitive(value, currentPath)}
              </>
            )}
          </div>
          
          <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity flex-shrink-0">
            {showCopyPath && (
              <button
                onClick={() => handleCopyPath(currentPath)}
                className={cn(
                  "p-1 rounded",
                  "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                title="Copy path"
              >
                {copiedPathKey === currentPath ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Link2 className="w-3 h-3" />
                )}
              </button>
            )}
            <button
              onClick={() => handleCopy(value, currentPath)}
              className={cn(
                "p-1 rounded",
                "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              title="Copy value"
            >
              {copiedPath === currentPath ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {isObject && expanded && (
          <div className="relative ml-4">
            {childEntries.map(([k, v], index) => 
              renderNode(k, v, currentPath, depth + 1, index === childEntries.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
    return (
      <div className={cn("text-muted-foreground text-sm italic p-4", className)}>
        No data available
      </div>
    );
  }

  const rootEntries = Array.isArray(data) 
    ? data.map((item, index) => [index, item])
    : typeof data === "object"
      ? Object.entries(data)
      : [];

  return (
    <div className={cn("w-full min-w-0 max-w-full rounded-lg border bg-card overflow-hidden", className)}>
      {title && (
        <div 
          className="px-4 py-2.5 border-b font-medium text-sm shrink-0"
          style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
        >
          {title}
        </div>
      )}
      <div className="w-full min-w-0 p-3 max-h-96 overflow-auto">
        {Array.isArray(data) || typeof data === "object" ? (
          rootEntries.map(([key, value], index) => 
            renderNode(key, value, "", 0, index === rootEntries.length - 1)
          )
        ) : (
          renderPrimitive(data, "root")
        )}
      </div>
    </div>
  );
};

export default NestedDataTree;
