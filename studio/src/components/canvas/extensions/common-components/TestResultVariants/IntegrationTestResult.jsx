import React, { useMemo, useState, useCallback } from "react";
import {
  Globe,
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
  FileJson,
  Link,
  Key,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ResultSection from "./ResultSection";
import FieldValueRow from "./FieldValueRow";
import KeyValueGrid from "./KeyValueGrid";

const HTTP_METHOD_COLORS = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  PATCH: "#8b5cf6",
  DELETE: "#ef4444",
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

const IntegrationTestResult = ({
  inputs,
  outputs,
  node,
  theme = {},
  executedAt,
  onRerun = null,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  
  const accentColor = theme.accentColor || "#3b82f6";
  const responseStatusCode =
    outputs?.status_code ?? outputs?.statusCode ?? outputs?.status;
  const hasError =
    outputs?.error ||
    outputs?.status === "error" ||
    (responseStatusCode != null && responseStatusCode >= 400);
  const timestamp = executedAt || outputs?.executedAt || outputs?.timestamp || new Date().toISOString();

  const normalizedInputs = useMemo(() => {
    return inputs?.response || inputs || {};
  }, [inputs]);

  const normalizedOutputs = useMemo(() => {
    return outputs?.response || outputs || {};
  }, [outputs]);

  const requestData = useMemo(() => {
    return {
      url: normalizedInputs.url || normalizedInputs.endpoint || "",
      method: (normalizedInputs.method || "GET").toUpperCase(),
      headers: normalizedInputs.headers || {},
      body: normalizedInputs.body || normalizedInputs.data || normalizedInputs.payload,
      queryParams: normalizedInputs.queryParams || normalizedInputs.params || {},
      timeout: normalizedInputs.timeout,
      auth: normalizedInputs.auth || normalizedInputs.authorization,
    };
  }, [normalizedInputs]);

  const responseData = useMemo(() => {
    const statusCode =
      normalizedOutputs.status_code ??
      normalizedOutputs.statusCode ??
      normalizedOutputs.status;
    if (hasError && statusCode == null) {
      return null;
    }

    return {
      statusCode,
      statusText: normalizedOutputs.statusText ?? normalizedOutputs.status_text,
      headers: normalizedOutputs.headers || {},
      body: normalizedOutputs.body ?? normalizedOutputs.data ?? normalizedOutputs.response ?? normalizedOutputs,
      duration: normalizedOutputs.duration ?? normalizedOutputs.responseTime,
    };
  }, [normalizedOutputs, hasError]);

  const errorMessage = useMemo(() => {
    if (!hasError) return null;
    return outputs?.error?.message || outputs?.message || outputs?.error || "Request failed";
  }, [hasError, outputs]);

  const methodColor = HTTP_METHOD_COLORS[requestData.method] || "#6b7280";

  const handleCopyAll = useCallback(async () => {
    try {
      const data = {
        request: requestData,
        response: responseData,
        executedAt: timestamp,
      };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, [requestData, responseData, timestamp]);

  const handleDownload = useCallback(() => {
    try {
      const data = {
        request: requestData,
        response: responseData,
        executedAt: timestamp,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `http-result-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download:", e);
    }
  }, [requestData, responseData, timestamp]);

  const statusCodeClass = responseData?.statusCode
    ? responseData.statusCode < 300
      ? "text-emerald-600 bg-emerald-50"
      : responseData.statusCode < 400
      ? "text-amber-600 bg-amber-50"
      : "text-red-600 bg-red-50"
    : "";

  return (
    <div className="flex flex-col gap-4 w-full min-w-0 max-w-full">
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          hasError 
            ? "bg-red-50/50 border-red-200/50" 
            : "bg-blue-50/50 border-blue-200/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              hasError ? "bg-red-100" : "bg-blue-100"
            )}
          >
            {hasError ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 text-xs font-bold rounded"
                style={{ backgroundColor: `${methodColor}20`, color: methodColor }}
              >
                {requestData.method}
              </span>
              <span className={cn(
                "text-sm font-semibold",
                hasError ? "text-red-700" : "text-blue-700"
              )}>
                {hasError ? "Request Failed" : "Request Successful"}
              </span>
              {responseData?.statusCode && (
                <span className={cn("px-2 py-0.5 text-xs font-medium rounded", statusCodeClass)}>
                  {responseData.statusCode} {responseData.statusText}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(timestamp)}</span>
              </div>
              {responseData?.duration && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Hash className="w-3 h-3" />
                  <span>{responseData.duration}ms</span>
                </div>
              )}
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
        icon={Link}
        title="Endpoint"
        subtitle={requestData.url}
        accentColor={methodColor}
        defaultExpanded={true}
      >
        <div className="space-y-3 w-full min-w-0">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg w-full min-w-0">
            <span
              className="px-2.5 py-1 text-xs font-bold rounded flex-shrink-0"
              style={{ backgroundColor: `${methodColor}20`, color: methodColor }}
            >
              {requestData.method}
            </span>
            <code className="text-sm font-mono text-foreground break-all min-w-0 flex-1">
              {requestData.url}
            </code>
          </div>

          {Object.keys(requestData.queryParams || {}).length > 0 && (
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Query Parameters
              </p>
              <KeyValueGrid data={requestData.queryParams} columns={2} />
            </div>
          )}
        </div>
      </ResultSection>

      {(Object.keys(requestData.headers || {}).length > 0 || requestData.auth) && (
        <ResultSection
          icon={Key}
          title="Headers & Auth"
          badge={Object.keys(requestData.headers || {}).length > 0 ? `${Object.keys(requestData.headers).length} headers` : undefined}
          accentColor={accentColor}
          defaultExpanded={false}
        >
          <div className="space-y-4">
            {requestData.auth && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Authorization
                </p>
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100/50">
                  <p className="text-sm font-mono text-foreground">
                    {typeof requestData.auth === "object" 
                      ? `${requestData.auth.type || "Bearer"} ••••••••`
                      : "••••••••"}
                  </p>
                </div>
              </div>
            )}
            
            {Object.keys(requestData.headers || {}).length > 0 && (
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Request Headers
                </p>
                <KeyValueGrid data={requestData.headers} columns={1} />
              </div>
            )}
          </div>
        </ResultSection>
      )}

      {requestData.body && (
        <ResultSection
          icon={Send}
          title="Request Body"
          accentColor={accentColor}
          defaultExpanded={true}
        >
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 overflow-auto max-h-64 min-w-0">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">
              {typeof requestData.body === "object"
                ? JSON.stringify(requestData.body, null, 2)
                : requestData.body}
            </pre>
          </div>
        </ResultSection>
      )}

      {hasError ? (
        <ResultSection
          icon={AlertCircle}
          title="Error Details"
          accentColor="#ef4444"
          variant="error"
          defaultExpanded={true}
          collapsible={false}
        >
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-700 mb-1">
                Request Failed
                {responseData?.statusCode && ` (${responseData.statusCode})`}
              </p>
              <p className="text-sm text-red-600 break-words">
                {errorMessage}
              </p>
            </div>
          </div>
        </ResultSection>
      ) : responseData ? (
        <ResultSection
          icon={FileJson}
          title="Response Body"
          subtitle={
            responseData.statusCode != null
              ? `Status: ${responseData.statusCode} ${(responseData.statusText || "").trim()}`
              : undefined
          }
          accentColor="#10b981"
          variant="success"
          defaultExpanded={true}
        >
          <div className="space-y-3">
            {responseData.statusCode != null && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">Status code</span>
                <span className={cn("px-2.5 py-1 text-sm font-semibold rounded-lg", statusCodeClass)}>
                  {responseData.statusCode}
                  {responseData.statusText ? ` ${responseData.statusText}` : ""}
                </span>
              </div>
            )}
            <div className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100/50 overflow-auto max-h-96 min-w-0">
              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">
                {typeof responseData.body === "object"
                  ? JSON.stringify(responseData.body, null, 2)
                  : responseData.body ?? "Empty response"}
              </pre>
            </div>
          </div>
        </ResultSection>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 bg-muted/30 rounded-xl border border-dashed border-border">
          <Inbox className="w-10 h-10 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No Response
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              The request did not return a response
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationTestResult;
