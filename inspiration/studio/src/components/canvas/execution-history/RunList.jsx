import dayjs from "dayjs";
import { cn } from "@/lib/utils";

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
  return STATUS_MAP[status.toLowerCase()] || { color: "#9e9e9e", label: status || "Unknown" };
}

function getDuration(execution) {
  if (execution?.start_at && execution?.end_at) {
    const start = dayjs(execution.start_at);
    const end = dayjs(execution.end_at);
    const diffMs = end.diff(start);
    if (diffMs < 1000) return `${diffMs}ms`;
    if (diffMs < 60000) return `${(diffMs / 1000).toFixed(1)}s`;
    return `${Math.floor(diffMs / 60000)}m ${Math.floor((diffMs % 60000) / 1000)}s`;
  }
  return null;
}

function RunList({ executions, selectedId, onSelect, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <span className="text-sm text-muted-foreground">Loading executions...</span>
      </div>
    );
  }

  if (!executions || executions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <span className="text-sm text-muted-foreground">No executions found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {executions.map((execution) => {
        const statusInfo = getStatusInfo(execution);
        const duration = getDuration(execution);
        const isSelected = selectedId === execution._id;

        return (
          <div
            key={execution._id}
            className={cn(
              "flex cursor-pointer flex-col gap-1 border-b border-border/50 px-3 py-2.5 transition-colors hover:bg-muted/50",
              isSelected && "bg-primary/10 hover:bg-primary/10"
            )}
            onClick={() => onSelect(execution)}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: statusInfo.color }}
              />
              <span className="text-xs font-medium text-foreground">
                {dayjs(execution.start_at).format("DD MMM, HH:mm:ss")}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-4">
              <span className="text-[0.6875rem] font-medium" style={{ color: statusInfo.color }}>
                {statusInfo.label}
              </span>
              {duration && (
                <span className="text-[0.6875rem] text-muted-foreground">{duration}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RunList;
export { getStatusInfo };
