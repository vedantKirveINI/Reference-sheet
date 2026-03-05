import React, { useMemo, useState, useCallback } from "react";
import {
  GitBranch,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Download,
  RotateCcw,
  Check,
  FileJson,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ResultSection from "./ResultSection";
import AdaptiveDataDisplay from "../AdaptiveDataDisplay";

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

const NODE_ID_KEYS = [
  "nextNodeId",
  "nodeId",
  "targetNodeId",
  "next_node_id",
  "nextNode",
  "action",
  "id",
  "node_id",
  "targetNode",
  "result",
];

const IfElseTestResult = ({
  inputs,
  outputs,
  node,
  theme = {},
  executedAt,
  onRerun = null,
  canvasRef = null,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const accentColor = theme.accentColor || "#3b82f6";
  const hasError =
    outputs?.error ||
    outputs?.status === "error" ||
    (typeof outputs?.message === "string" &&
      outputs?.message?.toLowerCase?.().includes("error"));
  const timestamp =
    executedAt ||
    outputs?.executedAt ||
    outputs?.timestamp ||
    new Date().toISOString();

  const normalizedOutputs = useMemo(() => {
    if (!outputs || typeof outputs !== "object") return {};
    return outputs?.response ?? outputs;
  }, [outputs]);

  const canvasNodeMap = useMemo(() => {
    if (!canvasRef?.current) return {};
    try {
      const diagram = canvasRef.current.getDiagram?.();
      const json = canvasRef.current.getModelJSON?.();
      if (!json) return {};
      const model = typeof json === "string" ? JSON.parse(json) : json;
      const nodeDataArray = model?.nodeDataArray ?? [];
      const map = {};
      nodeDataArray.forEach((n) => {
        const key = n?.key ?? n?.id;
        if (key != null) {
          const nodeObj = diagram?.findNodeForKey?.(key);
          const liveData = nodeObj?.data;
          const _src = liveData?._src ?? n?._src;
          map[String(key)] = {
            key,
            name:
              liveData?.name ??
              liveData?.text ??
              n?.name ??
              n?.text ??
              n?.label ??
              `Node ${key}`,
            _src,
            type: liveData?.type ?? n?.type ?? null,
          };
        }
      });
      return map;
    } catch {
      return {};
    }
  }, [canvasRef]);

  const collectNodeIdsFromPayload = useCallback((payload, out = new Set()) => {
    if (payload == null) return out;
    if (typeof payload === "string" || typeof payload === "number") {
      out.add(String(payload));
      return out;
    }
    if (Array.isArray(payload)) {
      payload.forEach((item) => collectNodeIdsFromPayload(item, out));
      return out;
    }
    if (typeof payload === "object") {
      Object.entries(payload).forEach(([k, v]) => {
        if (
          NODE_ID_KEYS.includes(k) &&
          (typeof v === "string" || typeof v === "number")
        ) {
          out.add(String(v));
        } else {
          collectNodeIdsFromPayload(v, out);
        }
      });
    }
    return out;
  }, []);

  const resolvedNextNodes = useMemo(() => {
    const ids = collectNodeIdsFromPayload(normalizedOutputs);
    return Array.from(ids)
      .map((id) => canvasNodeMap[id])
      .filter(Boolean);
  }, [normalizedOutputs, canvasNodeMap, collectNodeIdsFromPayload]);

  const branchTaken = useMemo(() => {
    return (
      normalizedOutputs.branch ??
      normalizedOutputs.branchTaken ??
      normalizedOutputs.matchedBranch ??
      null
    );
  }, [normalizedOutputs]);

  const resultPayload = useMemo(() => {
    return (
      normalizedOutputs.result ??
      normalizedOutputs.output ??
      normalizedOutputs.data ??
      normalizedOutputs
    );
  }, [normalizedOutputs]);

  const conditionsEvaluated = useMemo(() => {
    return (
      normalizedOutputs.conditionsEvaluated ??
      normalizedOutputs.conditions ??
      normalizedOutputs.evaluatedConditions ??
      null
    );
  }, [normalizedOutputs]);

  const errorMessage = useMemo(() => {
    if (!hasError) return null;
    return (
      outputs?.error?.message ??
      outputs?.message ??
      outputs?.error ??
      "Execution failed"
    );
  }, [hasError, outputs]);

  const handleCopyAll = useCallback(async () => {
    try {
      const data = {
        inputs: inputs ?? {},
        outputs: normalizedOutputs,
        executedAt: timestamp,
      };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      // ignore
    }
  }, [inputs, normalizedOutputs, timestamp]);

  const handleDownload = useCallback(() => {
    try {
      const data = {
        inputs: inputs ?? {},
        outputs: normalizedOutputs,
        executedAt: timestamp,
        nodeName: node?.name || node?.text,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ifelse-result-${node?.key || "node"}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  }, [inputs, normalizedOutputs, timestamp, node]);

  const hasStructuredContent =
    branchTaken != null ||
    (conditionsEvaluated != null &&
      (Array.isArray(conditionsEvaluated)
        ? conditionsEvaluated.length > 0
        : Object.keys(conditionsEvaluated || {}).length > 0));

  return (
    <div className="flex flex-col gap-4 w-full min-w-0 max-w-full">
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          hasError
            ? "bg-red-50/50 border-red-200/50"
            : "bg-blue-50/50 border-blue-200/50",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-6 h-6 rounded-xl flex items-center justify-center",
              hasError ? "bg-red-100" : "bg-blue-100",
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
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <span
                className={cn(
                  "text-sm font-semibold",
                  hasError ? "text-red-700" : "text-blue-700",
                )}
              >
                {hasError
                  ? "Condition check failed"
                  : "Condition check completed"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(timestamp)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyAll}>
            {copiedAll ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="ml-1.5">{copiedAll ? "Copied" : "Copy"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
            <span className="ml-1.5">Download</span>
          </Button>
          {onRerun && (
            <Button variant="outline" size="sm" onClick={onRerun}>
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="ml-1.5">Re-run</span>
            </Button>
          )}
        </div>
      </div>

      {hasError && errorMessage && (
        <ResultSection
          icon={XCircle}
          title="Error"
          accentColor="#ef4444"
          variant="error"
          defaultExpanded={true}
          collapsible={false}
        >
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 break-words">
              {typeof errorMessage === "string"
                ? errorMessage
                : JSON.stringify(errorMessage)}
            </p>
          </div>
        </ResultSection>
      )}

      {!hasError && hasStructuredContent && branchTaken != null && (
        <ResultSection
          icon={GitBranch}
          title="Branch taken"
          accentColor={accentColor}
          defaultExpanded={true}
        >
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <span className="text-sm font-medium text-foreground capitalize">
              {String(branchTaken)}
            </span>
          </div>
        </ResultSection>
      )}

      {!hasError && resolvedNextNodes.length > 0 && (
        <ResultSection
          icon={ArrowRight}
          title="Next step"
          accentColor={accentColor}
          defaultExpanded={true}
        >
          <div className="space-y-2">
            {resolvedNextNodes.map((canvasNode) => (
              <div
                key={canvasNode.key}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
              >
                {canvasNode._src ? (
                  <img
                    src={canvasNode._src}
                    alt=""
                    className="w-8 h-8 p-[.2rem] rounded-lg object-contain flex-shrink-0 bg-background border border-border/50"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground border border-border/50"
                    title={canvasNode.type ?? "Node"}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {canvasNode.name}
                  </p>
                  {canvasNode.type != null && canvasNode.type !== "" && (
                    <p className="text-xs text-muted-foreground">
                      {String(canvasNode.type).replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ResultSection>
      )}

      {!hasError && conditionsEvaluated != null && (
        <ResultSection
          icon={FileJson}
          title="Conditions evaluated"
          accentColor={accentColor}
          defaultExpanded={false}
        >
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 overflow-auto max-h-64">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
              {typeof conditionsEvaluated === "object"
                ? JSON.stringify(conditionsEvaluated, null, 2)
                : String(conditionsEvaluated)}
            </pre>
          </div>
        </ResultSection>
      )}

      <ResultSection
        icon={FileJson}
        title="Output"
        accentColor={accentColor}
        defaultExpanded={true}
      >
        {resultPayload != null &&
        typeof resultPayload === "object" &&
        Object.keys(resultPayload).length > 0 ? (
          Object.keys(resultPayload).length <= 3 ? (
            <div className="rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
              {Object.entries(resultPayload).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border/30 last:border-b-0"
                >
                  <span className="text-xs font-medium text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm text-foreground truncate max-w-[12rem]">
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-64 overflow-auto">
              <AdaptiveDataDisplay
                data={resultPayload}
                title="Output"
                accentColor={accentColor}
                showViewToggle={false}
                showSearch={false}
              />
            </div>
          )
        ) : (
          <div className="p-3 rounded-lg border border-border/50 bg-muted/20">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
              {resultPayload != null && resultPayload !== normalizedOutputs
                ? typeof resultPayload === "object"
                  ? JSON.stringify(resultPayload, null, 2)
                  : String(resultPayload)
                : JSON.stringify(normalizedOutputs, null, 2) ||
                  "No output data"}
            </pre>
          </div>
        )}
      </ResultSection>
    </div>
  );
};

export default IfElseTestResult;
