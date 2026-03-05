import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Settings,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const NodeIcon = ({ iconSrc, hasErrors }) => {
  const [imgError, setImgError] = useState(false);

  if (!iconSrc || imgError) {
    return (
      <div
        className={cn(
          "w-8 h-8 rounded-lg bg-white flex items-center justify-center",
          "border",
          hasErrors ? "border-red-200" : "border-amber-200"
        )}
      >
        {hasErrors ? (
          <AlertCircle className="w-4 h-4 text-red-400" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        )}
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center">
      <img
        src={iconSrc}
        alt=""
        className="w-4 h-4"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

const IssueRow = ({ issue, severity }) => {
  const isError = severity === "error";
  return (
    <div className="flex items-start gap-2 py-1.5">
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
          isError ? "bg-red-400" : "bg-amber-400"
        )}
      />
      <p
        className={cn(
          "text-xs leading-relaxed",
          isError ? "text-red-600" : "text-amber-600"
        )}
      >
        {issue.message}
      </p>
    </div>
  );
};

const NodeIssueCard = ({ nodeIssue, onFixNow }) => {
  const hasErrors = nodeIssue.errors.length > 0;
  const allIssues = [...nodeIssue.errors, ...nodeIssue.warnings];

  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        hasErrors
          ? "border-red-100 bg-red-50/50"
          : "border-amber-100 bg-amber-50/50"
      )}
    >
      <div className="flex items-start gap-3">
        <NodeIcon iconSrc={nodeIssue.nodeIcon} hasErrors={hasErrors} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-zinc-800 truncate">
              {nodeIssue.nodeName}
            </span>
            {nodeIssue.isTrigger && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-zinc-100 text-[10px] font-medium text-zinc-400 shrink-0">
                <Zap className="w-2.5 h-2.5" />
                Trigger
              </span>
            )}
          </div>
          <div className="space-y-0.5">
            {allIssues.map((issue, idx) => (
              <IssueRow key={idx} issue={issue} severity={issue.severity} />
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "shrink-0 h-7 px-2.5 text-xs font-medium rounded-lg gap-1",
            hasErrors
              ? "text-red-600 hover:bg-red-100 hover:text-red-700"
              : "text-amber-600 hover:bg-amber-100 hover:text-amber-700"
          )}
          onClick={() => onFixNow(nodeIssue.nodeKey)}
        >
          <Settings className="w-3 h-3" />
          Fix
        </Button>
      </div>
    </div>
  );
};

const AllGoodState = () => (
  <div
    className={cn(
      "rounded-xl border border-emerald-100 bg-emerald-50/50 p-4",
      "flex items-center gap-3"
    )}
  >
    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" strokeWidth={2} />
    </div>
    <div>
      <p className="text-sm font-medium text-emerald-800">
        All steps configured
      </p>
      <p className="text-xs text-emerald-600/70 mt-0.5">
        Your workflow is ready to publish
      </p>
    </div>
  </div>
);

const ValidationSummary = ({
  issues = [],
  totalErrors = 0,
  totalWarnings = 0,
  isClean = true,
  onFixNow = () => {},
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isClean) {
    return (
      <div data-testid="validation-summary-clean">
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2.5 px-1">
          Pre-publish check
        </h4>
        <AllGoodState />
      </div>
    );
  }

  const summaryParts = [];
  if (totalErrors > 0) {
    summaryParts.push(
      `${totalErrors} ${totalErrors === 1 ? "error" : "errors"}`
    );
  }
  if (totalWarnings > 0) {
    summaryParts.push(
      `${totalWarnings} ${totalWarnings === 1 ? "warning" : "warnings"}`
    );
  }
  const summaryText = summaryParts.join(" and ");

  return (
    <div data-testid="validation-summary">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Pre-publish check
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <div
        className={cn(
          "rounded-xl border p-3",
          totalErrors > 0
            ? "border-red-100 bg-red-50/30"
            : "border-amber-100 bg-amber-50/30"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          {totalErrors > 0 ? (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <p
            className={cn(
              "text-sm font-medium",
              totalErrors > 0 ? "text-red-700" : "text-amber-700"
            )}
          >
            {totalErrors > 0
              ? `Fix ${summaryText} before publishing`
              : `${summaryText} to review`}
          </p>
        </div>
        <p className="text-xs text-zinc-400 ml-6">
          {issues.length} {issues.length === 1 ? "step needs" : "steps need"}{" "}
          attention
        </p>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ScrollArea className="max-h-[300px] mt-2.5">
            <div className="space-y-2">
              {issues.map((nodeIssue) => (
                <NodeIssueCard
                  key={nodeIssue.nodeKey}
                  nodeIssue={nodeIssue}
                  onFixNow={onFixNow}
                />
              ))}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </div>
  );
};

export default ValidationSummary;
