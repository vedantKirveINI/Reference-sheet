import React, { useState } from "react";
import { getLucideIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const STATUS_ICONS = {
  success: "Check",
  error: "XCircle",
  skipped: "Circle",
};

const STATUS_COLORS = {
  success: "#34a853",
  error: "#ea4335",
  skipped: "#9b9a97",
};

const DebugStepRow = ({ step, depth = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = step.children && step.children.length > 0;

  const statusIcon = STATUS_ICONS[step.status] || "?";
  const statusColor = STATUS_COLORS[step.status] || "#666";

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center gap-2 py-1 cursor-pointer font-mono text-xs text-foreground rounded-sm transition-colors hover:bg-muted",
          step.status === "error" && "text-destructive"
        )}
        style={{ paddingLeft: `${depth * 1rem + 0.75rem}` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className="w-3.5 text-xs text-muted-foreground select-none">
            {expanded ? "▼" : "▶"}
          </span>
        )}
        <span
          className="text-sm font-semibold min-w-3.5 flex items-center justify-center"
          style={{ color: statusColor }}
        >
          {statusIcon === "?" ? "?" : getLucideIcon(statusIcon, { size: 14 })}
        </span>
        <span className="flex-1 font-medium">{step.label}</span>
        {step.inferredType && (
          <span className="text-xs text-muted-foreground bg-muted py-0.5 px-2 rounded-sm">
            {step.inferredType}
            {step.nullable && (
              <span className="text-amber-500 ml-0.5">?</span>
            )}
          </span>
        )}
        {step.value !== null && step.value !== undefined && (
          <span className="text-xs text-green-600 font-semibold font-mono">
            ={" "}
            {typeof step.value === "object"
              ? JSON.stringify(step.value)
              : String(step.value)}
          </span>
        )}
      </div>
      {step.errorMessage && (
        <div
          className="text-xs text-destructive mt-1 mb-1 pl-2 border-l-2 border-destructive/30"
          style={{ paddingLeft: `${depth * 1rem + 2rem}` }}
        >
          {step.errorMessage}
        </div>
      )}
      {hasChildren && expanded && (
        <div className="flex flex-col ml-2 border-l border-border pl-2">
          {step.children.map((child, index) => (
            <DebugStepRow
              key={child?.nodeId || index}
              step={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EvaluationJourney = ({ evaluationData }) => {
  if (!evaluationData || !evaluationData.rootStep) {
    return (
      <div className="p-4 text-center text-muted-foreground text-xs leading-normal">
        No evaluation journey available. Evaluate a formula to see step-by-step execution.
      </div>
    );
  }

  const { success, value, errors, rootStep } = evaluationData;

  return (
    <div className="flex flex-col gap-3">
      {!success && errors && errors.length > 0 && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
          <div className="text-xs font-bold text-foreground mb-2">Errors</div>
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs text-destructive mb-1 last:mb-0"
            >
              <span className="text-destructive">{getLucideIcon("XCircle", { size: 14 })}</span>
              {error}
            </div>
          ))}
        </div>
      )}

      {success && value !== null && value !== undefined && (
        <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="text-xs font-bold text-foreground mb-2">Final Result</div>
          <div className="font-mono text-xs text-green-600 break-all [&_pre]:m-0 [&_pre]:text-xs [&_pre]:text-green-600">
            {typeof value === "object" ? (
              <pre>{JSON.stringify(value, null, 2)}</pre>
            ) : (
              String(value)
            )}
          </div>
        </div>
      )}

      {rootStep && (
        <div className="p-3 bg-background border border-border rounded-md max-h-[20rem] overflow-y-auto">
          <div className="text-xs font-bold text-foreground mb-2">Execution Steps</div>
          <div className="flex flex-col">
            <DebugStepRow step={rootStep} depth={0} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationJourney;
