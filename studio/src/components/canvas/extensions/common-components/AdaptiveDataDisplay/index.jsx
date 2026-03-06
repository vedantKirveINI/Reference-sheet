import React, { useMemo, useState, useCallback } from "react";
import { Code, Table, TreeDeciduous, Search, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { getDisplayMode, isArrayOfFlatObjects, humanizeKey } from "./utils";
import { detectSchema, detectNestedSchemas } from "./SchemaDetector";
import FlatDataTable from "./FlatDataTable";
import NestedDataTree from "./NestedDataTree";
import ArrayDataView from "./ArrayDataView";
import { SmartCardRenderer } from "./SmartCards";
import KeyValueCard from "./SmartCards/KeyValueCard";

const AdaptiveDataDisplay = ({
  data,
  title,
  accentColor = "#3b82f6",
  forceMode = null,
  showViewToggle = true,
  showSearch = true,
  enableSmartCards = true,
  useInputStyle = false,
  collapsible = false,
  defaultExpanded = true,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [manualMode, setManualMode] = useState(null);
  const [useSmartView, setUseSmartView] = useState(true);
  const [rawBlockCopied, setRawBlockCopied] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleCopyRawBlock = useCallback(async () => {
    try {
      const text = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
      await navigator.clipboard.writeText(text);
      setRawBlockCopied(true);
      setTimeout(() => setRawBlockCopied(false), 2000);
    } catch (e) {}
  }, [data]);

  const autoMode = useMemo(() => getDisplayMode(data), [data]);
  const displayMode = forceMode || manualMode || autoMode;

  const detectedSchema = useMemo(() => {
    if (!enableSmartCards) return null;
    if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
    return detectSchema(data);
  }, [data, enableSmartCards]);

  const nestedSchemas = useMemo(() => {
    if (!enableSmartCards) return [];
    if (typeof data !== "object" || data === null || Array.isArray(data)) return [];
    return detectNestedSchemas(data);
  }, [data, enableSmartCards]);

  const hasSmartSchema = detectedSchema && detectedSchema.type !== "generic" && detectedSchema.type !== "primitive";
  const hasNestedSmartSchemas = nestedSchemas.length > 0;

  const isObjectData = typeof data === "object" && data !== null && !Array.isArray(data);
  const showSmartViewOption = hasSmartSchema || hasNestedSmartSchemas || displayMode === "keyvalue" || (displayMode === "tree" && isObjectData) || (displayMode === "raw" && isObjectData);

  const showModeToggle = useMemo(() => {
    if (!showViewToggle) return false;
    return autoMode === "tree" || autoMode === "table" || hasSmartSchema || hasNestedSmartSchemas || isObjectData;
  }, [showViewToggle, autoMode, hasSmartSchema, hasNestedSmartSchemas, isObjectData]);

  const showSearchBar = useMemo(() => {
    if (!showSearch) return false;
    return displayMode === "tree" && data && typeof data === "object" && !useSmartView;
  }, [showSearch, displayMode, data, useSmartView]);

  const hasComplexValues = (obj) => {
    if (typeof obj !== "object" || obj === null) return false;
    return Object.values(obj).some(v => typeof v === "object" && v !== null);
  };

  const RemainingFieldsRenderer = ({ data, label, accentColor }) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    const isComplex = hasComplexValues(data);
    
    if (isComplex) {
      return (
        <NestedDataTree
          data={data}
          title={label}
          accentColor={accentColor}
          defaultExpandDepth={1}
          showCopyPath={true}
        />
      );
    }
    
    return (
      <KeyValueCard
        data={data}
        label={label}
        accentColor={accentColor}
        showHeader={true}
        inputStyle={useInputStyle}
      />
    );
  };

  const renderSmartContent = () => {
    if (hasSmartSchema) {
      const hasRemainingFields = detectedSchema.remainingFields && Object.keys(detectedSchema.remainingFields).length > 0;
      
      return (
        <div className="p-4 space-y-4">
          <SmartCardRenderer
            schemaType={detectedSchema.type}
            data={detectedSchema}
            label={title}
            accentColor={accentColor}
            inputStyle={useInputStyle}
          />
          {hasRemainingFields && (
            <RemainingFieldsRenderer
              data={detectedSchema.remainingFields}
              label="Additional Fields"
              accentColor={accentColor}
            />
          )}
        </div>
      );
    }

    if (hasNestedSmartSchemas) {
      const processedPaths = new Set();
      nestedSchemas.forEach(ns => processedPaths.add(ns.path));

      const getRemainingData = () => {
        const remaining = {};
        for (const [key, value] of Object.entries(data)) {
          const isProcessed = nestedSchemas.some(ns => ns.path === key || ns.path.startsWith(`${key}.`));
          if (!isProcessed) {
            remaining[key] = value;
          }
        }
        return remaining;
      };

      const remainingData = getRemainingData();
      const hasRemaining = Object.keys(remainingData).length > 0;

      return (
        <div className="p-4 space-y-4">
          {nestedSchemas.map((ns, index) => {
            const hasSchemaRemaining = ns.schema.remainingFields && Object.keys(ns.schema.remainingFields).length > 0;
            return (
              <div key={ns.path} className="space-y-2">
                <SmartCardRenderer
                  schemaType={ns.schema.type}
                  data={ns.schema}
                  label={humanizeKey(ns.key)}
                  accentColor={accentColor}
                  inputStyle={useInputStyle}
                />
                {hasSchemaRemaining && (
                  <RemainingFieldsRenderer
                    data={ns.schema.remainingFields}
                    label={`${humanizeKey(ns.key)} - Additional`}
                    accentColor={accentColor}
                  />
                )}
              </div>
            );
          })}
          
          {hasRemaining && (
            <RemainingFieldsRenderer
              data={remainingData}
              label="Other Fields"
              accentColor={accentColor}
            />
          )}
        </div>
      );
    }

    if (displayMode === "keyvalue" || (displayMode === "tree" && isObjectData)) {
      return (
        <div className="p-4">
          <KeyValueCard
            data={data}
            label={null}
            accentColor={accentColor}
            showHeader={false}
            inputStyle={useInputStyle}
          />
        </div>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (useSmartView && enableSmartCards && showSmartViewOption) {
      return renderSmartContent();
    }

    switch (displayMode) {
      case "empty":
        return (
          <div className="text-muted-foreground text-sm italic p-4 text-center">
            No data available
          </div>
        );

      case "primitive":
        return (
          <div className="p-4">
            <div className="font-mono text-sm bg-muted/50 rounded-md p-3 break-all">
              {String(data)}
            </div>
          </div>
        );

      case "keyvalue":
        return (
          <FlatDataTable
            data={data}
            accentColor={accentColor}
          />
        );

      case "table":
        return (
          <ArrayDataView
            data={data}
            accentColor={accentColor}
          />
        );

      case "tree":
      default:
        return (
          <NestedDataTree
            data={data}
            accentColor={accentColor}
            searchQuery={searchQuery}
            defaultExpandDepth={1}
          />
        );
    }
  };

  return (
    <div className={cn("w-full max-w-full min-w-0 rounded-lg border bg-card overflow-hidden", className)}>
      {(title || showModeToggle || showSearchBar || collapsible) && (
        <div 
          className="px-4 py-2.5 border-b flex items-center justify-between gap-3"
          style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {collapsible && (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                title={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? (
                  <icons.chevronDown className="w-4 h-4" />
                ) : (
                  <icons.chevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {title && (
              <span className="font-medium text-sm">{title}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {expanded && showSearchBar && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="h-7 pl-8 pr-7 text-xs w-40"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            
            {expanded && showModeToggle && (
              <div className="flex items-center border rounded-md overflow-hidden">
                {enableSmartCards && showSmartViewOption && (
                  <button
                    onClick={() => {
                      setUseSmartView(true);
                      setManualMode(null);
                    }}
                    className={cn(
                      "p-1.5 transition-colors",
                      useSmartView 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-muted-foreground"
                    )}
                    title="Smart view"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setUseSmartView(false);
                    setManualMode("tree");
                  }}
                  className={cn(
                    "p-1.5 transition-colors",
                    !useSmartView && displayMode === "tree" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground"
                  )}
                  title="Tree view"
                >
                  <TreeDeciduous className="w-3.5 h-3.5" />
                </button>
                {isArrayOfFlatObjects(data) && (
                  <button
                    onClick={() => {
                      setUseSmartView(false);
                      setManualMode("table");
                    }}
                    className={cn(
                      "p-1.5 transition-colors",
                      !useSmartView && displayMode === "table" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-muted-foreground"
                    )}
                    title="Table view"
                  >
                    <Table className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setUseSmartView(false);
                    setManualMode("raw");
                  }}
                  className={cn(
                    "p-1.5 transition-colors",
                    !useSmartView && displayMode === "raw" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground"
                  )}
                  title="Raw JSON"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {expanded && !useSmartView && displayMode === "raw" ? (
        <div className="relative w-full min-w-0 p-3 max-h-96 overflow-auto">
          <pre className="font-mono text-xs whitespace-pre-wrap break-all bg-muted/30 p-3 pr-12 rounded-md">
            {JSON.stringify(data, null, 2)}
          </pre>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopyRawBlock}
            title={rawBlockCopied ? "Copied" : "Copy"}
            className={cn(
              "absolute top-2 right-2 h-8 w-8 shrink-0",
              rawBlockCopied && "text-green-600 bg-green-500/10"
            )}
          >
            {rawBlockCopied ? (
              <icons.check className="h-4 w-4" />
            ) : (
              <icons.copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : expanded ? (
        <div className="w-full min-w-0 overflow-x-auto">
          {renderContent()}
        </div>
      ) : null}
    </div>
  );
};

export default AdaptiveDataDisplay;
export { FlatDataTable, NestedDataTree, ArrayDataView };
export * from "./utils";
export * from "./SchemaDetector";
export { SmartCardRenderer } from "./SmartCards";
