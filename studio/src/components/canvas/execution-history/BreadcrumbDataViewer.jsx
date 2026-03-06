import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const CopyIcon = icons.copy;

function isPrimitive(val) {
  return val === null || typeof val !== "object";
}

function isSimpleObject(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return false;
  const keys = Object.keys(obj);
  return keys.length <= 3 && keys.every((k) => isPrimitive(obj[k]));
}

function isSimpleArray(arr) {
  if (!Array.isArray(arr)) return false;
  return arr.length <= 5 && arr.every((v) => isPrimitive(v));
}

function formatPrimitiveValue(val) {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return String(val);
}

function getValueClassName(val) {
  if (val === null || val === undefined) return "text-muted-foreground italic";
  if (typeof val === "number") return "text-primary";
  if (typeof val === "boolean") return "text-amber-600";
  return "";
}

function smartSummary(obj) {
  return Object.values(obj)
    .map((v) => formatPrimitiveValue(v))
    .join(" · ");
}

function formatLabel(key) {
  if (typeof key === "number") return `Item ${key + 1}`;
  return String(key)
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getAtPath(data, path) {
  let current = data;
  for (const segment of path) {
    if (current == null) return undefined;
    current = Array.isArray(current) ? current[segment.key] : current[segment.key];
  }
  return current;
}

function BreadcrumbDataViewer({ data, label = "All Fields" }) {
  const [path, setPath] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleDrillIn = useCallback((key, displayLabel) => {
    setPath((prev) => [...prev, { key, label: displayLabel }]);
  }, []);

  const handleBreadcrumbClick = useCallback((index) => {
    setPath((prev) => prev.slice(0, index));
  }, []);

  const handleCopy = useCallback(() => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [data]);

  if (data == null || (typeof data === "object" && Object.keys(data).length === 0)) {
    return <div className="py-2 text-center text-[0.6875rem] text-muted-foreground">No data available</div>;
  }

  const currentData = path.length === 0 ? data : getAtPath(data, path);

  const renderValue = (key, val, displayLabel) => {
    if (isPrimitive(val)) {
      return (
        <span className={cn("break-all py-0.5 text-[0.6875rem] leading-snug", getValueClassName(val))}>
          {formatPrimitiveValue(val)}
        </span>
      );
    }

    if (Array.isArray(val)) {
      if (isSimpleArray(val)) {
        return (
          <span className="break-all py-0.5 text-[0.6875rem] leading-snug text-foreground">
            {val.map((v) => formatPrimitiveValue(v)).join(", ")}
          </span>
        );
      }
      return (
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex h-auto gap-1 rounded-md bg-primary/10 px-2 py-1 text-[0.625rem] font-medium text-primary hover:bg-primary/20"
          onClick={() => handleDrillIn(key, displayLabel)}
        >
          {val.length} {val.length === 1 ? "item" : "items"} →
        </Button>
      );
    }

    if (isSimpleObject(val)) {
      return <span className="text-[0.6875rem] text-muted-foreground">{smartSummary(val)}</span>;
    }

    const fieldCount = Object.keys(val).length;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="inline-flex h-auto gap-1 rounded-md bg-primary/10 px-2 py-1 text-[0.625rem] font-medium text-primary hover:bg-primary/20"
        onClick={() => handleDrillIn(key, displayLabel)}
      >
        {fieldCount} {fieldCount === 1 ? "field" : "fields"} →
      </Button>
    );
  };

  const renderGrid = (obj) => {
    if (obj == null) {
      return <div className="py-2 text-center text-[0.6875rem] text-muted-foreground">No data available</div>;
    }

    if (isPrimitive(obj)) {
      return (
        <span className={cn("break-all py-0.5 text-[0.6875rem] leading-snug", getValueClassName(obj))}>
          {formatPrimitiveValue(obj)}
        </span>
      );
    }

    if (Array.isArray(obj)) {
      return obj.map((item, idx) => (
        <div key={idx} className="mb-1.5 rounded-md border border-border/50 px-2 py-1.5">
          <div className="mb-1 text-[0.625rem] font-semibold text-muted-foreground">Item {idx + 1}</div>
          {isPrimitive(item) ? (
            <span className={cn("break-all py-0.5 text-[0.6875rem] leading-snug", getValueClassName(item))}>
              {formatPrimitiveValue(item)}
            </span>
          ) : typeof item === "object" && !Array.isArray(item) ? (
            <div className="grid grid-cols-[8.75rem_1fr] gap-x-2.5 gap-y-1 items-start">
              {Object.entries(item).map(([k, v]) => (
                <KeyValueRow key={k} objKey={k} value={v} onDrillIn={handleDrillIn} />
              ))}
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex h-auto gap-1 rounded-md bg-primary/10 px-2 py-1 text-[0.625rem] font-medium text-primary hover:bg-primary/20"
              onClick={() => handleDrillIn(idx, `Item ${idx + 1}`)}
            >
              {Array.isArray(item) ? `${item.length} items →` : "View →"}
            </Button>
          )}
        </div>
      ));
    }

    return (
      <div className="grid grid-cols-[8.75rem_1fr] gap-x-2.5 gap-y-1 items-start">
        {Object.entries(obj).map(([k, v]) => (
          <KeyValueRow key={k} objKey={k} value={v} onDrillIn={handleDrillIn} />
        ))}
      </div>
    );
  };

  function KeyValueRow({ objKey, value, onDrillIn }) {
    const displayLabel = formatLabel(objKey);
    return (
      <>
        <span className="break-all py-0.5 text-[0.6875rem] font-medium text-muted-foreground">{displayLabel}</span>
        {renderValue(objKey, value, displayLabel)}
      </>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        {path.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[0.6875rem] font-medium text-primary hover:bg-transparent hover:underline"
              onClick={() => handleBreadcrumbClick(0)}
            >
              {label}
            </Button>
            {path.map((segment, idx) => (
              <span key={idx} className="inline-flex items-center gap-1">
                <span className="text-[0.625rem] text-muted-foreground/70">›</span>
                {idx < path.length - 1 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-[0.6875rem] font-medium text-primary hover:bg-transparent hover:underline"
                    onClick={() => handleBreadcrumbClick(idx + 1)}
                  >
                    {segment.label}
                  </Button>
                ) : (
                  <span className="text-[0.6875rem] font-semibold text-foreground">{segment.label}</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div />
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-auto shrink-0 gap-1 rounded border-border px-2 py-1 text-[0.625rem] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={handleCopy}
        >
          <CopyIcon className="h-2.5 w-2.5" />
          {copied ? "Copied!" : "Copy JSON"}
        </Button>
      </div>
      {renderGrid(currentData)}
    </div>
  );
}

export default BreadcrumbDataViewer;
