import { useState, useEffect, useCallback, Component } from "react";
import dayjs from "dayjs";
import flowExecutionLogsServices from "@src/sdk-services/flow-execution-logs-sdk-services";
import NodeCard from "./NodeCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { icons } from "@/components/icons";

const ReplayIcon = icons.refreshCw;

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
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <span className="text-sm text-muted-foreground">
            Unable to display logs. Please try refreshing.
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

function formatDuration(ms) {
  if (ms == null) return null;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function getDuration(execution) {
  if (execution?.start_at && execution?.end_at) {
    const start = dayjs(execution.start_at);
    const end = dayjs(execution.end_at);
    const diffMs = end.diff(start);
    return formatDuration(diffMs);
  }
  return null;
}

function groupLogsIntoNodes(rawLogs) {
  const nodeMap = {};
  const nodeOrder = [];

  for (const log of rawLogs) {
    const { node_id, node_name, node_type, event_name, data, error, result, duration_ms, created_at } = log;

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

    const logIndicatesFailure =
      error != null ||
      (log.execution_state && String(log.execution_state).toUpperCase() === "FAILED") ||
      (log.status && String(log.status).toLowerCase() === "failed");
    if (logIndicatesFailure) {
      node.status = "error";
      node.error = node.error || error || data;
    }

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

function RunDetail({ execution, workspaceId, assetId, onReplay }) {
  const [rawLogs, setRawLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!execution || !workspaceId || !assetId) return;

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
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <span className="text-sm text-muted-foreground">
          Select an execution to view logs
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <span className="text-sm text-muted-foreground">Loading logs...</span>
      </div>
    );
  }

  const nodes = groupLogsIntoNodes(rawLogs);
  const execStatus = (execution?.status || execution?.state || "").toLowerCase();
  const hasFailedNode = nodes.some((n) => n.status === "error" || n.status === "failed");
  const isFailed = ["failed", "error"].includes(execStatus) || hasFailedNode;

  const handleReplay = async () => {
    if (!onReplay || isReplaying) return;
    setIsReplaying(true);
    try {
      await onReplay(execution);
    } finally {
      setIsReplaying(false);
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
          <div className="flex items-center gap-2.5">
            <Badge variant={isFailed ? "destructive" : "default"}>
              {isFailed ? "Failed" : "Success"}
            </Badge>
            <span className="text-[0.6875rem] text-muted-foreground">
              0 nodes · {getDuration(execution) || "—"} · {dayjs(execution.start_at).format("DD MMM HH:mm")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isFailed && onReplay && (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10"
                onClick={handleReplay}
                disabled={isReplaying}
              >
                <ReplayIcon className="mr-1.5 h-3 w-3" />
                {isReplaying ? "Replaying..." : "Replay"}
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <span className="text-sm text-muted-foreground">
            No logs available for this execution
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2.5">
          <Badge variant={isFailed ? "destructive" : "default"}>
            {isFailed ? "Failed" : "Success"}
          </Badge>
          <span className="text-[0.6875rem] text-muted-foreground">
            {nodes.length} {nodes.length === 1 ? "node" : "nodes"} · {getDuration(execution) || "—"} · {dayjs(execution.start_at).format("DD MMM HH:mm")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isFailed && onReplay && (
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10"
              onClick={handleReplay}
              disabled={isReplaying}
            >
              <ReplayIcon className="mr-1.5 h-3 w-3" />
              {isReplaying ? "Replaying..." : "Replay"}
            </Button>
          )}
        </div>
      </div>

      <LogsErrorBoundary>
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-2 p-3">
            {nodes.map((node) => (
              <NodeCard key={node.nodeId} node={node} defaultExpanded={node.status === "error"} />
            ))}
          </div>
        </ScrollArea>
      </LogsErrorBoundary>
    </div>
  );
}

export default RunDetail;
