import React, { useMemo, useState, useCallback } from "react";
import { Copy, Download, RotateCcw, ChevronDown, ChevronRight, Check, Search, X, AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";
import StatusHeader from "./StatusHeader";
import DataPanel from "./DataPanel";
import TableRenderer from "./TableRenderer";
import MarkdownRenderer from "./MarkdownRenderer";
import ResultActions from "./ResultActions";
import AdaptiveDataDisplay from "../AdaptiveDataDisplay";

const normalizePayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  if (Array.isArray(payload)) {
    return { Items: payload };
  }
  return payload;
};

const isPrimitiveValue = (value) => {
  return ["string", "number", "boolean"].includes(typeof value);
};

const ExecutionResultV4 = ({
  inputs,
  outputs,
  node,
  theme = {},
  executedAt,
  resultType = "json",
  resultActions = [],
  resultRenderer = null,
  onRerun = null,
  showDiff = false,
  previousOutputs = null,
  layout = "vertical",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  const normalizedData = useMemo(() => {
    const rawInputs = inputs?.response || inputs;
    const rawOutputs = outputs?.response || outputs;

    const normalized = {
      inputs: isPrimitiveValue(rawInputs) ? rawInputs : normalizePayload(rawInputs),
      outputs: isPrimitiveValue(rawOutputs) ? rawOutputs : normalizePayload(rawOutputs),
    };

    return normalized;
  }, [inputs, outputs]);

  const hasError = outputs?.error || outputs?.status === "error";
  const accentColor = theme.accentColor || "#3b82f6";
  const timestamp = executedAt || outputs?.executedAt || outputs?.timestamp || new Date().toISOString();

  const errorMessage = useMemo(() => {
    if (!hasError) return null;
    return outputs?.error?.message || outputs?.message || outputs?.error || "An error occurred during execution";
  }, [hasError, outputs]);

  const isEmptyOutput = useMemo(() => {
    const outputs = normalizedData.outputs;

    // Primitives are never empty (they always have a value)
    if (isPrimitiveValue(outputs)) {
      return false;
    }

    // null or undefined are empty
    if (!outputs) return true;

    // Arrays are empty if length is 0
    if (Array.isArray(outputs)) {
      return outputs.length === 0;
    }

    // Objects are empty if they have no keys
    if (typeof outputs === "object") {
      return Object.keys(outputs).length === 0;
    }

    return false;
  }, [normalizedData.outputs]);

  const handleCopyAll = useCallback(async () => {
    try {
      const data = {
        inputs: normalizedData.inputs,
        outputs: normalizedData.outputs,
        executedAt: timestamp,
      };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedKey("all");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
    }
  }, [normalizedData, timestamp]);

  const handleDownload = useCallback(() => {
    try {
      const data = {
        inputs: normalizedData.inputs,
        outputs: normalizedData.outputs,
        executedAt: timestamp,
        nodeName: node?.name || node?.text,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `test-result-${node?.key || "node"}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
    }
  }, [normalizedData, timestamp, node]);

  const defaultActions = useMemo(() => {
    const actions = [
      {
        id: "copy",
        label: "Copy All",
        icon: copiedKey === "all" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />,
        onClick: handleCopyAll,
      },
      {
        id: "download",
        label: "Download",
        icon: <Download className="w-3.5 h-3.5" />,
        onClick: handleDownload,
      },
    ];

    if (onRerun) {
      actions.push({
        id: "rerun",
        label: "Re-run Test",
        icon: <RotateCcw className="w-3.5 h-3.5" />,
        onClick: onRerun,
      });
    }

    return actions;
  }, [copiedKey, handleCopyAll, handleDownload, onRerun]);

  const allActions = useMemo(() => {
    return [...defaultActions, ...resultActions];
  }, [defaultActions, resultActions]);

  const renderOutputContent = useCallback(() => {
    if (resultRenderer) {
      const custom = resultRenderer(normalizedData.inputs, normalizedData.outputs, null);
      if (custom !== undefined) {
        return custom;
      }
    }

    // Check if outputs is a primitive (string, number, boolean)
    const isPrimitive = isPrimitiveValue(normalizedData.outputs);

    switch (resultType) {
      case "table":
        return (
          <TableRenderer
            data={normalizedData.outputs}
            searchQuery={searchQuery}
            accentColor={accentColor}
          />
        );

      case "markdown":
        return (
          <MarkdownRenderer
            content={normalizedData.outputs}
            accentColor={accentColor}
          />
        );

      case "html":
        return (
          <div
            className={styles.htmlContent}
            dangerouslySetInnerHTML={{
              __html: typeof normalizedData.outputs === "string"
                ? normalizedData.outputs
                : JSON.stringify(normalizedData.outputs),
            }}
          />
        );

      case "json":
      default:
        // Use AdaptiveDataDisplay for primitives since DataPanel expects objects
        if (isPrimitive) {
          return (
            <AdaptiveDataDisplay
              data={normalizedData.outputs}
              title="Output"
              accentColor={hasError ? "#ef4444" : accentColor}
              showViewToggle={true}
              showSearch={true}
              useInputStyle={true}
            />
          );
        }
        return (
          <DataPanel
            title="Output"
            data={normalizedData.outputs}
            accentColor={accentColor}
            variant="output"
            hasError={hasError}
            searchQuery={searchQuery}
          />
        );
    }
  }, [resultRenderer, resultType, normalizedData, searchQuery, accentColor, hasError]);

  return (
    <div className={styles.container}>
      <StatusHeader
        hasError={hasError}
        nodeName={node?.name || node?.text || "Node"}
        theme={theme}
        executedAt={timestamp}
      />

      <ResultActions actions={allActions} theme={theme} />

      {typeof normalizedData.outputs === "object" &&
        normalizedData.outputs !== null &&
        !Array.isArray(normalizedData.outputs) &&
        Object.keys(normalizedData.outputs).length > 5 && (
          <div className={styles.searchBar}>
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in results..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchQuery("")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      {hasError && errorMessage && (
        <div className={styles.errorBanner}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <div className={styles.errorContent}>
            <span className={styles.errorTitle}>Execution Failed</span>
            <span className={styles.errorDescription}>
              {typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage)}
            </span>
          </div>
        </div>
      )}

      {layout === "vertical" ? (
        <div className={styles.verticalLayout}>
          {Object.keys(normalizedData.inputs).length > 0 && (
            <div className="min-w-0 w-full overflow-x-auto">
              <AdaptiveDataDisplay
                data={normalizedData.inputs}
                title="Input"
                accentColor={accentColor}
                showViewToggle={true}
                showSearch={true}
                collapsible={true}
                defaultExpanded={true}
              />
            </div>
          )}
          {isEmptyOutput && !hasError ? (
            <div className={styles.emptyOutputState}>
              <Inbox className="w-8 h-8" />
              <span className={styles.emptyOutputTitle}>No Output Data</span>
              <span className={styles.emptyOutputDescription}>
                The operation completed but returned no data. This may be expected for some operations.
              </span>
            </div>
          ) : (
            <div className="min-w-0 w-full overflow-x-auto">
              <AdaptiveDataDisplay
                data={normalizedData.outputs}
                title="Output"
                accentColor={hasError ? "#ef4444" : accentColor}
                showViewToggle={true}
                showSearch={true}
                useInputStyle={true}
                collapsible={true}
                defaultExpanded={true}
              />
            </div>
          )}
        </div>
      ) : (
        <div className={styles.splitPanel}>
          <DataPanel
            title="Input"
            data={normalizedData.inputs}
            accentColor={accentColor}
            variant="input"
            searchQuery={searchQuery}
          />
          <div className={styles.divider} />
          <div className={styles.outputPanel}>
            {renderOutputContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionResultV4;
