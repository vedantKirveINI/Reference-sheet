import { useState, useEffect, useCallback, useMemo, Component } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import flowExecutionServices from "@/sdk-services/flow-execution-sdk-services";
import flowExecutionLogsServices from "@/sdk-services/flow-execution-logs-sdk-services";
import BreadcrumbDataViewer from "../../../canvas/execution-history/BreadcrumbDataViewer";

class LogsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="text-sm text-zinc-400 text-center py-4">
          Unable to display logs. Please try refreshing.
        </p>
      );
    }
    return this.props.children;
  }
}

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "succeeded", label: "Succeeded" },
  { key: "failed", label: "Failed" },
];

const STATUS_MAP = {
  success: { color: "#4caf50", label: "Success" },
  completed: { color: "#4caf50", label: "Success" },
  failed: { color: "#f44336", label: "Failed" },
  error: { color: "#f44336", label: "Failed" },
  running: { color: "#ff9800", label: "Running" },
  in_progress: { color: "#ff9800", label: "Running" },
  cancelled: { color: "#9e9e9e", label: "Cancelled" },
};

function getStatusInfo(execution) {
  const status = execution?.status || execution?.state || "";
  return (
    STATUS_MAP[status.toLowerCase()] || {
      color: "#9e9e9e",
      label: status || "Unknown",
    }
  );
}

function getDuration(execution) {
  if (!execution?.start_at) return null;
  const start = dayjs(execution.start_at);
  const end = execution.end_at ? dayjs(execution.end_at) : dayjs();
  const diffMs = end.diff(start);
  if (diffMs < 1000) return `${diffMs}ms`;
  if (diffMs < 60000) return `${(diffMs / 1000).toFixed(1)}s`;
  return `${Math.floor(diffMs / 60000)}m ${Math.floor((diffMs % 60000) / 1000)}s`;
}

function formatDuration(ms) {
  if (ms == null) return null;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function getErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function getSubtitle(node) {
  const isFailed = node.status === "error" || node.status === "failed";
  if (isFailed) {
    return getErrorMessage(node.error) || "Error occurred";
  }

  if (
    node.output &&
    typeof node.output === "object" &&
    !Array.isArray(node.output)
  ) {
    const keys = Object.keys(node.output);
    if (keys.length > 0) {
      return `Returned ${keys.length} ${
        keys.length === 1 ? "field" : "fields"
      }`;
    }
  }

  if (node.output && Array.isArray(node.output)) {
    return `Returned ${node.output.length} ${
      node.output.length === 1 ? "item" : "items"
    }`;
  }

  const nodeType = (node.nodeType || "").toLowerCase();
  if (
    nodeType.includes("condition") ||
    nodeType.includes("ifelse") ||
    nodeType.includes("filter")
  ) {
    return "Condition evaluated";
  }
  if (nodeType.includes("trigger")) {
    return "Trigger fired";
  }

  return "Completed";
}

function getIconInfo(node) {
  const isFailed = node.status === "error" || node.status === "failed";
  if (isFailed) {
    return { className: "bg-destructive/10 text-destructive", icon: "error" };
  }

  const nodeType = (node.nodeType || "").toLowerCase();
  if (
    nodeType.includes("trigger") ||
    nodeType.includes("webhook") ||
    nodeType.includes("schedule") ||
    nodeType.includes("form")
  ) {
    return { className: "bg-primary/10 text-primary", icon: "trigger" };
  }
  if (
    nodeType.includes("condition") ||
    nodeType.includes("ifelse") ||
    nodeType.includes("if_else") ||
    nodeType.includes("filter")
  ) {
    return { className: "bg-purple-500/10 text-purple-700", icon: "condition" };
  }
  return { className: "bg-emerald-500/10 text-emerald-700", icon: "action" };
}

function NodeIcon({ type }) {
  if (type === "trigger") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  }
  if (type === "condition") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  }
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <polyline points="9 11 12 14 22 4" />
    </svg>
  );
}

function NodeCard({ node, defaultExpanded }) {
  const isFailed = node.status === "error" || node.status === "failed";
  const initialExpanded =
    defaultExpanded !== undefined ? defaultExpanded : isFailed;
  const [expanded, setExpanded] = useState(initialExpanded);

  const availableTabs = useMemo(() => {
    const tabs = [];
    if (node.input != null) tabs.push("Input");
    if (node.output != null) tabs.push("Output");
    if (node.logs && node.logs.length > 0) tabs.push("Logs");
    return tabs;
  }, [node.input, node.output, node.logs]);

  const [activeTab, setActiveTab] = useState(availableTabs[0] || "Input");

  const iconInfo = getIconInfo(node);
  const subtitle = getSubtitle(node);
  const duration = formatDuration(node.durationMs);
  const errorMsg = isFailed ? getErrorMessage(node.error) : null;

  const currentTab = availableTabs.includes(activeTab)
    ? activeTab
    : availableTabs[0];

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-shadow hover:shadow-md",
        isFailed && "border-destructive/50"
      )}
    >
      <div
        className="flex cursor-pointer items-center gap-2.5 bg-muted/30 px-3.5 py-2.5 hover:bg-muted/50"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm", iconInfo.className)}>
          <NodeIcon type={iconInfo.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-foreground">{node.nodeName}</div>
          <div
            className={cn("truncate text-[0.625rem]", isFailed ? "text-destructive" : "text-muted-foreground")}
          >
            {subtitle}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {duration && (
            <span className="text-[0.625rem] tabular-nums text-muted-foreground">{duration}</span>
          )}
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[0.625rem] font-semibold",
              isFailed ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700"
            )}
          >
            {isFailed ? "FAIL" : "OK"}
          </span>
          <span
            className={cn("flex items-center text-xs text-muted-foreground transition-transform", expanded && "rotate-180")}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-background">
          {errorMsg && (
            <div className="mx-3.5 mt-2 rounded-md bg-destructive/10 px-3 py-2 text-[0.6875rem] leading-snug text-destructive">
              {errorMsg}
            </div>
          )}

          {availableTabs.length > 0 && (
            <>
              <div className="flex border-b border-border">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    className={cn(
                      "px-3.5 py-1.5 text-[0.6875rem] font-medium transition-colors hover:text-foreground",
                      currentTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="max-h-48 overflow-y-auto p-2.5">
                {currentTab === "Input" && (
                  <BreadcrumbDataViewer
                    data={node.input}
                    label="Input Fields"
                  />
                )}
                {currentTab === "Output" && (
                  <BreadcrumbDataViewer
                    data={node.output}
                    label="Output Fields"
                  />
                )}
                {currentTab === "Logs" && (
                  <div className="flex flex-col gap-1">
                    {node.logs.map((logEntry, idx) => (
                      <div key={idx} className="flex gap-2 text-[0.6875rem] leading-snug">
                        {logEntry.timestamp && (
                          <span className="shrink-0 text-[0.625rem] tabular-nums text-muted-foreground">
                            {dayjs(logEntry.timestamp).format("HH:mm:ss")}
                          </span>
                        )}
                        <span className="break-all text-foreground">
                          {typeof logEntry.message === "string"
                            ? logEntry.message
                            : typeof logEntry.message === "object" &&
                              logEntry.message !== null
                            ? JSON.stringify(logEntry.message)
                            : String(logEntry.message ?? "")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function groupLogsIntoNodes(rawLogs) {
  const nodeMap = {};
  const nodeOrder = [];

  for (const log of rawLogs) {
    const {
      node_id,
      node_name,
      node_type,
      event_name,
      data,
      error,
      result,
      duration_ms,
      created_at,
    } = log;

    if (!node_id) continue;

    if (!nodeMap[node_id]) {
      nodeMap[node_id] = {
        nodeId: node_id,
        nodeName: node_name || node_type || "Unknown Node",
        nodeType: node_type || "",
        status: "success",
        durationMs: null,
        input: null,
        output: null,
        error: null,
        logs: [],
      };
      nodeOrder.push(node_id);
    }

    const node = nodeMap[node_id];

    switch (event_name) {
      case "node_input":
        node.input = data;
        break;
      case "node_output":
      case "execute_node_result":
        node.output = data || result;
        break;
      case "node_error":
      case "execute_node_error":
        node.status = "error";
        node.error = error || data;
        break;
      case "end_node":
        if (duration_ms != null) node.durationMs = duration_ms;
        break;
      case "node_log":
        node.logs.push({ message: data, timestamp: created_at });
        break;
    }
  }

  return nodeOrder.map((id) => nodeMap[id]);
}

const RunListItem = ({ execution, isSelected, onSelect }) => {
  const statusInfo = getStatusInfo(execution);
  const duration = getDuration(execution);

  return (
    <div
      className={cn(
        "flex flex-col gap-1 px-3 py-2.5 cursor-pointer border-b border-zinc-50 transition-colors duration-100",
        isSelected ? "bg-blue-50" : "hover:bg-zinc-50"
      )}
      onClick={() => onSelect(execution)}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: statusInfo.color }}
        />
        <span className="text-xs font-medium text-zinc-800">
          {dayjs(execution.startedAt).format("DD MMM, HH:mm:ss")}
        </span>
      </div>
      <div className="flex items-center gap-2 pl-4">
        <span className="text-[11px] font-medium" style={{ color: statusInfo.color }}>
          {statusInfo.label}
        </span>
        {duration && (
          <span className="text-[11px] text-zinc-400">{duration}</span>
        )}
      </div>
    </div>
  );
};

const RunDetail = ({ execution, workspaceId, assetId }) => {
  const [rawLogs, setRawLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!execution || !workspaceId || !assetId || !execution._id) return;

    setIsLoading(true);
    setRawLogs([]);

    try {
      const response = await flowExecutionLogsServices.getList({
        workspace_id: workspaceId,
        asset_id: assetId,
        batch_id: execution._id,
        sort_type: "asc",
        limit: 500,
        page: 1,
      });

      if (response?.status === "success") {
        setRawLogs(response?.result?.docs || []);
      } else {
        setRawLogs([]);
      }
    } catch {
      setRawLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [execution, workspaceId, assetId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (!execution) {
    return (
      <div className="flex items-center justify-center flex-1 p-6">
        <span className="text-sm text-zinc-400">Select a run to view details</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 p-6">
        <span className="text-sm text-zinc-400">Loading details...</span>
      </div>
    );
  }

  const execStatus = (execution?.status || execution?.state || "").toLowerCase();
  const isFailed = ["failed", "error"].includes(execStatus);
  const isRunning = ["running", "in_progress"].includes(execStatus);
  const isCancelled = execStatus === "cancelled";
  const nodes = groupLogsIntoNodes(rawLogs);
  const duration = getDuration(execution);

  const badgeStyle = isFailed
    ? "bg-red-50 text-red-700"
    : isRunning
    ? "bg-amber-50 text-amber-700"
    : isCancelled
    ? "bg-zinc-100 text-zinc-500"
    : "bg-emerald-50 text-emerald-700";
  const badgeLabel = isFailed
    ? "Failed"
    : isRunning
    ? "Running"
    : isCancelled
    ? "Cancelled"
    : "Completed";

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",
            badgeStyle
          )}>
            {badgeLabel}
          </span>
          <span className="text-[11px] text-zinc-400">
            {nodes.length} {nodes.length === 1 ? "node" : "nodes"} ·{" "}
            {duration || "—"} ·{" "}
            {dayjs(execution.start_at).format("DD MMM HH:mm")}
          </span>
        </div>
      </div>

      <LogsErrorBoundary>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {nodes.length === 0 && (
            <div className="flex items-center justify-center flex-1 py-8">
              <span className="text-sm text-zinc-400">
                No logs available for this run
              </span>
            </div>
          )}
          {nodes.map((node) => (
            <NodeCard
              key={node.nodeId}
              node={node}
              defaultExpanded={node.status === "error"}
            />
          ))}
        </div>
      </LogsErrorBoundary>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="flex items-center gap-3 p-3 animate-pulse">
    <div className="w-2 h-2 rounded-full bg-zinc-200" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 w-28 bg-zinc-200 rounded" />
      <div className="h-2.5 w-14 bg-zinc-200 rounded" />
    </div>
  </div>
);

const ActivityTab = ({ workspaceId, assetId }) => {
  const [executions, setExecutions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedExecution, setSelectedExecution] = useState(null);

  const fetchExecutions = useCallback(async () => {
    if (!workspaceId || !assetId) return;

    setIsLoading(true);
    try {
      const response = await flowExecutionServices.getList({
        workspace_id: workspaceId,
        asset_id: assetId,
        limit: 100,
        page: 1,
      });

      if (response?.status === "success") {
        const docs = response?.result?.docs || [];
        setExecutions(docs);
        if (docs.length > 0 && !selectedExecution) {
          setSelectedExecution(docs[0]);
        }
      } else {
        toast.error("Unable to fetch execution history");
      }
    } catch {
      toast.error("Unable to fetch execution history");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, assetId]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const filteredExecutions = useMemo(() => {
    return executions.filter((e) => {
      if (filter === "all") return true;
      if (filter === "succeeded")
        return e.status === "success" || e.status === "completed";
      if (filter === "failed")
        return e.status === "failed" || e.status === "error";
      return true;
    });
  }, [executions, filter]);

  const counts = useMemo(
    () => ({
      all: executions.length,
      succeeded: executions.filter(
        (e) => e.status === "success" || e.status === "completed",
      ).length,
      failed: executions.filter(
        (e) => e.status === "failed" || e.status === "error",
      ).length,
    }),
    [executions],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="py-1"
      data-testid="sequence-activity-tab"
    >
      <div
        className="flex items-center gap-2 mb-3"
        data-testid="sequence-activity-filter-pills"
      >
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
              filter === opt.key
                ? "bg-zinc-900 text-white"
                : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 border border-zinc-100"
            )}
            data-testid={`sequence-filter-pill-${opt.key}`}
          >
            {opt.label}
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                filter === opt.key
                  ? "bg-white/20 text-white"
                  : "bg-zinc-200/60 text-zinc-400"
              )}
            >
              {counts[opt.key]}
            </span>
          </button>
        ))}

        <button
          onClick={fetchExecutions}
          className={cn(
            "ml-auto flex items-center justify-center w-8 h-8 rounded-lg",
            "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50",
            "transition-all duration-150"
          )}
          data-testid="sequence-refresh-executions-btn"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
        </button>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-zinc-100 overflow-hidden" data-testid="sequence-activity-loading-skeleton">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!isLoading && filteredExecutions.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-12"
          data-testid="sequence-activity-empty-state"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 mb-4">
            <Clock className="w-5 h-5 text-zinc-300" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">
            No activity yet
          </p>
          <p className="text-xs text-zinc-400 text-center max-w-[280px]">
            Runs will show up here once your sequence executes.
          </p>
        </div>
      )}

      {!isLoading && filteredExecutions.length > 0 && (
        <div
          className="flex rounded-xl border border-zinc-100 overflow-hidden"
          style={{ height: "380px" }}
          data-testid="sequence-execution-split-panel"
        >
          <div className="w-[180px] shrink-0 border-r border-zinc-100 overflow-y-auto bg-white">
            {filteredExecutions.map((execution) => (
              <RunListItem
                key={execution.id}
                execution={execution}
                isSelected={selectedExecution?.id === execution.id}
                onSelect={setSelectedExecution}
              />
            ))}
          </div>

          <div className="flex-1 min-w-0 overflow-hidden flex flex-col bg-white">
            <RunDetail
              execution={selectedExecution}
              workspaceId={workspaceId}
              assetId={assetId}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ActivityTab;
