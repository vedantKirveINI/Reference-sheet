import React, { useMemo, useState, useCallback } from "react";
import {
  Table2,
  FileSpreadsheet,
  LayoutGrid,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Download,
  RotateCcw,
  AlertCircle,
  Inbox,
  ArrowRight,
  Database,
  Edit3,
  Trash2,
  Search,
  Plus,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ResultSection from "./ResultSection";
import FieldValueRow from "./FieldValueRow";
import KeyValueGrid from "./KeyValueGrid";
import { getFilterSummary } from "@/components/canvas/extensions/sheet/filterUtils";

const getOperationConfig = (operationType) => {
  const opType = (operationType || "").toUpperCase();

  if (opType.includes("CREATE")) {
    return {
      label: "Create Record",
      icon: Plus,
      sendingLabel: "Creating Record",
      successLabel: "Record Created",
      color: "#10b981",
    };
  }

  if (opType.includes("READ") || opType.includes("FIND") || opType.includes("GET") || opType.includes("FETCH")) {
    return {
      label: "Read Record",
      icon: Search,
      sendingLabel: "Querying Records",
      successLabel: "Records Retrieved",
      color: "#3b82f6",
    };
  }

  if (opType.includes("UPDATE") || opType.includes("EDIT") || opType.includes("PATCH")) {
    return {
      label: "Update Record",
      icon: Edit3,
      sendingLabel: "Updating Record",
      successLabel: "Record Updated",
      color: "#f59e0b",
    };
  }

  if (opType.includes("DELETE") || opType.includes("REMOVE")) {
    return {
      label: "Delete Record",
      icon: Trash2,
      sendingLabel: "Deleting Record",
      successLabel: "Record Deleted",
      color: "#ef4444",
    };
  }

  return {
    label: "Sheet Operation",
    icon: Table2,
    sendingLabel: "Processing",
    successLabel: "Operation Complete",
    color: "#3b82f6",
  };
};

const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return timestamp;
  }
};

const extractRecordFields = (record) => {
  if (!record || !Array.isArray(record)) return [];

  return record
    .filter((field) => field.isChecked !== false)
    .map((field) => {
      const key = field.key || field.label || `Field ${field.id}`;
      let value = null;

      if (field.value?.blockStr !== undefined) {
        value = field.value.blockStr;
      } else if (field.value?.blocks?.[0]?.value !== undefined) {
        value = field.value.blocks[0].value;
      } else if (typeof field.value === "string" || typeof field.value === "number") {
        value = field.value;
      } else {
        value = field.value;
      }

      const iconValue = field.icon;
      const isValidIconUrl = typeof iconValue === "string" && (iconValue.startsWith("http") || iconValue.startsWith("data:") || iconValue.startsWith("/"));

      return {
        key,
        value,
        alias: field.alias || field.type || "Field",
        icon: isValidIconUrl ? iconValue : null,
        type: field.type || "STRING",
      };
    });
};

const SheetTestResult = ({
  inputs,
  outputs,
  node,
  theme = {},
  executedAt,
  onRerun = null,
  operationType = "CREATE_SHEET_RECORD_V2",
  goData = null,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const opConfig = getOperationConfig(operationType);
  const accentColor = theme.accentColor || opConfig.color || "#3b82f6";
  const timestamp = executedAt || outputs?.executedAt || outputs?.timestamp || new Date().toISOString();

  const normalizedOutputs = useMemo(() => {
    return outputs?.response || outputs || {};
  }, [outputs]);

  const { hasError, errorMessage } = useMemo(() => {
    if (outputs?.error) {
      return {
        hasError: true,
        errorMessage: outputs.error?.message || (typeof outputs.error === "string" ? outputs.error : JSON.stringify(outputs.error))
      };
    }
    if (outputs?.status === "error" || outputs?.status === "failed" || outputs?.status === "failure") {
      return {
        hasError: true,
        errorMessage: outputs.message || outputs.errorMessage || "Operation failed"
      };
    }
    if (outputs?.success === false) {
      return {
        hasError: true,
        errorMessage: outputs.message || outputs.errorMessage || "Operation was not successful"
      };
    }
    if (outputs?.statusCode && outputs.statusCode >= 400) {
      return {
        hasError: true,
        errorMessage: outputs.message || outputs.errorMessage || `HTTP Error ${outputs.statusCode}`
      };
    }
    if (outputs?.response?.error) {
      return {
        hasError: true,
        errorMessage: outputs.response.error?.message || (typeof outputs.response.error === "string" ? outputs.response.error : JSON.stringify(outputs.response.error))
      };
    }
    // if (!outputs || (typeof outputs === "object" && Object.keys(outputs).length === 0)) {
    //   return {
    //     hasError: true,
    //     errorMessage: "No response received from the server. The operation may have failed."
    //   };
    // }
    return { hasError: false, errorMessage: null };
  }, [outputs]);

  const initializationData = useMemo(() => {
    const asset = goData?.asset || {};
    const subSheet = goData?.subSheet || {};
    const view = goData?.view || {};
    const connection = goData?.connection || goData?.datasource || {};

    return {
      connectionName: connection.name || connection.connection_name || null,
      connectionId: connection.id || connection.connection_id || null,
      sheetName: asset.name || null,
      sheetId: asset.id || null,
      tableName: subSheet.name || null,
      tableId: subSheet.id || null,
      viewName: view.name || "Default View",
      viewId: view.id || null,
    };
  }, [goData]);

  console.log("goData >>", goData)

  const configurationFields = useMemo(() => {
    const opType = operationType.toUpperCase();

    if (opType.includes("CREATE") || opType.includes("UPDATE")) {
      const record = goData?.record || [];
      return extractRecordFields(record);
    }

    if (opType.includes("READ") || opType.includes("FIND") || opType.includes("GET")) {
      const fields = [];

      if (goData?.recordId || goData?.record_id) {
        fields.push({ key: "Record ID", value: goData.recordId || goData.record_id, alias: "ID", type: "ID" });
      }
      if (goData?.filter || goData?.filters) {
        const filters = goData.filter || goData.filters;
        const filterSummary = getFilterSummary(filters);
        const filterRaw = typeof filters === "object" ? JSON.stringify(filters) : filters;

        fields.push({
          key: "Filter",
          alias: "Filter",
          type: "FILTER",
          ...(filterSummary ? { value: filterSummary, filterRaw } : { value: filterRaw })
        });
      }
      if (goData?.query) {
        fields.push({
          key: "Query",
          value: typeof goData.query === "object" ? JSON.stringify(goData.query) : goData.query,
          alias: "Query",
          type: "QUERY"
        });
      }
      if (goData?.limit) {
        fields.push({ key: "Limit", value: goData.limit, alias: "Limit", type: "NUMBER" });
      }
      if (goData?.offset || goData?.skip) {
        fields.push({ key: "Offset", value: goData.offset || goData.skip, alias: "Offset", type: "NUMBER" });
      }
      if (goData?.sort || goData?.orderBy) {
        const sort = goData.sort || goData.orderBy;
        fields.push({
          key: "Sort",
          value: typeof sort === "object" ? JSON.stringify(sort) : sort,
          alias: "Sort",
          type: "SORT"
        });
      }

      return fields.length > 0 ? fields : [{ key: "Query", value: "All records", alias: "Query", type: "QUERY" }];
    }

    if (opType.includes("DELETE")) {
      const fields = [];

      if (goData?.recordId || goData?.record_id) {
        fields.push({ key: "Record ID", value: goData.recordId || goData.record_id, alias: "ID", type: "ID" });
      }
      if (goData?.recordIds || goData?.record_ids) {
        const ids = goData.recordIds || goData.record_ids;
        fields.push({ key: "Record IDs", value: Array.isArray(ids) ? ids.join(", ") : ids, alias: "IDs", type: "ID" });
      }
      if (goData?.filter || goData?.filters) {
        const filters = goData.filter || goData.filters;
        const filterSummary = getFilterSummary(filters);
        const filterRaw = typeof filters === "object" ? JSON.stringify(filters) : filters;

        fields.push({
          key: "Filter",
          alias: "Filter",
          type: "FILTER",
          ...(filterSummary ? { value: filterSummary, filterRaw } : { value: filterRaw }),
        });

      }

      return fields.length > 0 ? fields : [{ key: "Target", value: "Selected records", alias: "Target", type: "TARGET" }];
    }

    const record = goData?.record || [];
    return extractRecordFields(record);
  }, [goData, operationType]);

  const outputData = useMemo(() => {
    if (hasError) return null;

    const result = normalizedOutputs;
    if (!result || Object.keys(result).length === 0) return null;

    if (result.Items) return result.Items;
    if (result.data) return result.data;
    if (result.response) return result.response;

    return result;
  }, [normalizedOutputs, hasError]);

  const handleCopyAll = useCallback(async () => {
    try {
      const data = {
        initialization: initializationData,
        configuration: configurationFields,
        output: outputData,
        executedAt: timestamp,
      };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, [initializationData, configurationFields, outputData, timestamp]);

  const handleDownload = useCallback(() => {
    try {
      const data = {
        initialization: initializationData,
        configuration: configurationFields,
        output: outputData,
        executedAt: timestamp,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `test-result-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download:", e);
    }
  }, [initializationData, configurationFields, outputData, timestamp]);

  const OpIcon = opConfig.icon;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex-wrap gap-6",
          hasError
            ? "bg-red-50/50 border-red-200/50"
            : "bg-emerald-50/50 border-emerald-200/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              hasError ? "bg-red-100" : "bg-emerald-100"
            )}
          >
            {hasError ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold",
                hasError ? "text-red-700" : "text-emerald-700"
              )}>
                {hasError ? "Execution Failed" : opConfig.successLabel}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/60 text-muted-foreground">
                {opConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(timestamp)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleCopyAll}
          >
            {copiedAll ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
          {onRerun && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={onRerun}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-run
            </Button>
          )}
        </div>
      </div>

      <ResultSection
        icon={Database}
        title="Connecting To"
        subtitle={initializationData.sheetName && initializationData.tableName
          ? `${initializationData.sheetName} › ${initializationData.tableName}`
          : initializationData.sheetName || initializationData.tableName || "Sheet connection"}
        accentColor={accentColor}
        defaultExpanded={false}
      >
        <div className="space-y-1">
          {initializationData.connectionName && (
            <FieldValueRow
              icon={Plug}
              label="Connection"
              value={initializationData.connectionName}
            />
          )}
          {initializationData.sheetName && (
            <FieldValueRow
              icon={FileSpreadsheet}
              label="Sheet"
              value={initializationData.sheetName}
            />
          )}
          {initializationData.tableName && (
            <FieldValueRow
              icon={Table2}
              label="Table"
              value={initializationData.tableName}
            />
          )}
          {initializationData.viewName && initializationData.viewName !== "Default View" && (
            <FieldValueRow
              icon={LayoutGrid}
              label="View"
              value={initializationData.viewName}
            />
          )}
        </div>
      </ResultSection>

      <ResultSection
        icon={Send}
        title={opConfig.sendingLabel}
        subtitle={`${configurationFields.length} field${configurationFields.length !== 1 ? "s" : ""}`}
        accentColor={accentColor}
        badge={configurationFields.length > 0 ? `${configurationFields.length} fields` : undefined}
        defaultExpanded={false}
      >
        {configurationFields.length > 0 ? (
          <div className="space-y-3">
            {configurationFields.map((field, index) => (
              <div
                key={field.key || index}
                className="p-3 bg-zinc-50/50 rounded-lg border border-zinc-100"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {field.icon ? (
                    <img
                      src={field.icon}
                      alt={field.alias}
                      className="w-4 h-4 object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : null}
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-muted-foreground">
                    {field.alias}
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground break-words mb-1">
                  {field.key}
                </div>
                <div className="text-sm text-muted-foreground break-words">
                  {field.value === null || field.value === undefined ? (
                    <span className="italic">Not set</span>
                  ) : typeof field.value === "object" ? (
                    <pre className="text-xs font-mono bg-zinc-100 p-2 rounded overflow-x-auto mt-1">
                      {JSON.stringify(field.value, null, 2)}
                    </pre>
                  ) : (
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {String(field.value)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No field data configured
          </div>
        )}
      </ResultSection>

      {hasError ? (
        <ResultSection
          icon={AlertCircle}
          title="Error"
          subtitle={errorMessage ? errorMessage.substring(0, 50) + (errorMessage.length > 50 ? "..." : "") : "Execution failed"}
          accentColor="#ef4444"
          variant="error"
          defaultExpanded={true}
          collapsible={false}
        >
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-700 mb-1">
                Execution Failed
              </p>
              <p className="text-sm text-red-600 break-words whitespace-pre-wrap">
                {errorMessage || "An unexpected error occurred while executing this test. Please check the configuration and try again."}
              </p>
              {outputs?.error?.code && (
                <p className="text-xs text-red-500 mt-2">
                  Error Code: {outputs.error.code}
                </p>
              )}
            </div>
          </div>
        </ResultSection>
      ) : outputData ? (
        <ResultSection
          icon={CheckCircle2}
          title="Result"
          subtitle="Operation completed successfully"
          accentColor="#10b981"
          variant="success"
          defaultExpanded={true}
        >
          {typeof outputData === "object" && !Array.isArray(outputData) ? (
            <KeyValueGrid
              data={outputData}
              columns={2}
              showCopy={true}
            />
          ) : Array.isArray(outputData) ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">
                {outputData.length} record{outputData.length !== 1 ? "s" : ""} returned
              </p>
              {outputData.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/30 rounded-lg border border-border/30"
                >
                  <KeyValueGrid
                    data={typeof item === "object" ? item : { value: item }}
                    columns={2}
                    showCopy={true}
                  />
                </div>
              ))}
              {outputData.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{outputData.length - 5} more records
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-muted/30 rounded-lg">
              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
                {JSON.stringify(outputData, null, 2)}
              </pre>
            </div>
          )}
        </ResultSection>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 bg-muted/30 rounded-xl border border-dashed border-border">
          <Inbox className="w-10 h-10 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No Output Data
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              The operation completed but returned no data
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheetTestResult;
