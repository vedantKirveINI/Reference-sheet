import { useMemo, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SEQUENCE_NODE_TYPES } from "@/components/sequence/constants";
import flowExecutionServices from "@/sdk-services/flow-execution-sdk-services";

dayjs.extend(relativeTime);

const getNodeLabel = (node) => {
  const name = node?.name || node?.data?.name;
  if (name) return name;

  const nodeType = node?.type || node?.data?.type;
  switch (nodeType) {
    case SEQUENCE_NODE_TYPES.TINY_MODULE:
      return "Module";
    case SEQUENCE_NODE_TYPES.WAIT:
      return "Wait";
    case SEQUENCE_NODE_TYPES.CONDITIONAL:
      return "Conditional";
    case SEQUENCE_NODE_TYPES.EXIT:
      return "Exit";
    case SEQUENCE_NODE_TYPES.HITL:
      return "Human in the Loop";
    case SEQUENCE_NODE_TYPES.MERGE_JOIN:
      return "Merge Join";
    case SEQUENCE_NODE_TYPES.LOOP_START:
      return "Loop Start";
    case SEQUENCE_NODE_TYPES.LOOP_END:
      return "Loop End";
    default:
      return nodeType || "Step";
  }
};

const OverviewTab = ({
  nodes = [],
  sequenceData = {},
  workspaceId,
  assetId,
}) => {
  const [healthStats, setHealthStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const isPublished = sequenceData?.status === "published";

  const triggerNode = useMemo(() => {
    if (!Array.isArray(nodes)) return null;
    return (
      nodes.find((node) => {
        const nodeType = node?.type || node?.data?.type;
        return nodeType === SEQUENCE_NODE_TYPES.TRIGGER;
      }) || null
    );
  }, [nodes]);

  const actionNodes = useMemo(() => {
    if (!Array.isArray(nodes)) return [];
    return nodes.filter((node) => {
      const nodeType = node?.type || node?.data?.type;
      return nodeType !== SEQUENCE_NODE_TYPES.TRIGGER;
    });
  }, [nodes]);

  const fetchHealthStats = useCallback(async () => {
    if (!workspaceId || !assetId || !isPublished) return;

    setIsLoadingStats(true);
    try {
      const response = await flowExecutionServices.getList({
        workspace_id: workspaceId,
        asset_id: assetId,
        limit: 100,
        page: 1,
      });

      if (response?.status === "success") {
        const executions = response?.result?.docs || [];
        const recentExecutions = executions.filter((e) =>
          dayjs(e.start_at).isAfter(dayjs().subtract(7, "day")),
        );
        const succeeded = recentExecutions.filter(
          (e) => e.status === "success" || e.status === "completed",
        ).length;
        const total = recentExecutions.length;
        const successRate =
          total > 0 ? Math.round((succeeded / total) * 100) : null;
        const lastExecution = executions.length > 0 ? executions[0] : null;

        setHealthStats({
          successRate,
          totalRuns: total,
          lastRun: lastExecution
            ? {
                time: lastExecution.start_at,
                status: lastExecution.status,
              }
            : null,
        });
      }
    } catch {
      setHealthStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  }, [workspaceId, assetId, isPublished]);

  useEffect(() => {
    fetchHealthStats();
  }, [fetchHealthStats]);

  if (!isPublished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center py-12 px-6"
        data-testid="sequence-overview-null-state"
      >
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full",
            "bg-blue-50 mb-5"
          )}
        >
          <Zap className="w-7 h-7 text-blue-500" strokeWidth={1.75} />
        </div>
        <h3
          className="text-lg font-semibold text-zinc-900 mb-2"
          data-testid="null-state-heading"
        >
          Ready to go live
        </h3>
        <p
          className="text-sm text-zinc-500 text-center max-w-[360px] leading-relaxed"
          data-testid="null-state-description"
        >
          Once published, you'll see how your sequence is performing — success
          rates, run history, and more.
        </p>
      </motion.div>
    );
  }

  const triggerDescription = triggerNode
    ? triggerNode?.name || triggerNode?.data?.name || "Starts when this sequence is triggered"
    : "Starts when this sequence is triggered";

  const displayNodes = actionNodes.slice(0, 6);
  const remainingCount = Math.max(0, actionNodes.length - 6);

  const getSuccessRateColor = (rate) => {
    if (rate === null) return "bg-zinc-300";
    if (rate > 90) return "bg-emerald-500";
    if (rate >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusColor = (status) => {
    if (status === "completed") return "bg-emerald-500";
    if (status === "failed") return "bg-red-500";
    return "bg-amber-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5 py-1"
      data-testid="sequence-overview-tab"
    >
      <div data-testid="starts-when-section">
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2.5 px-1">
          Starts when...
        </h4>
        <div
          className={cn(
            "bg-zinc-50 rounded-xl p-4",
            "border border-zinc-100"
          )}
          data-testid="trigger-card"
        >
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-zinc-100 shrink-0 mt-0.5">
              <Zap className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-zinc-700 leading-relaxed"
                data-testid="trigger-description"
              >
                {triggerDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      {actionNodes.length > 0 && (
        <div data-testid="then-does-section">
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2.5 px-1">
            Then does...
          </h4>
          <div className="flex flex-wrap gap-2" data-testid="sequence-action-nodes-list">
            {displayNodes.map((node, idx) => (
              <div
                key={idx}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5",
                  "bg-zinc-50 rounded-lg",
                  "border border-zinc-100"
                )}
                data-testid={`sequence-action-node-pill-${idx}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span className="text-xs font-medium text-zinc-600">
                  {getNodeLabel(node)}
                </span>
              </div>
            ))}
            {remainingCount > 0 && (
              <div
                className={cn(
                  "inline-flex items-center px-3 py-1.5",
                  "bg-zinc-50 rounded-lg",
                  "border border-zinc-100"
                )}
                data-testid="sequence-action-nodes-overflow"
              >
                <span className="text-xs font-medium text-zinc-400">
                  +{remainingCount} more
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div data-testid="health-section">
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2.5 px-1">
          Health at a glance
        </h4>
        <div className="grid grid-cols-3 gap-3" data-testid="sequence-health-metrics-grid">
          <div
            className={cn(
              "bg-zinc-50 rounded-xl p-4",
              "border border-zinc-100"
            )}
            data-testid="sequence-success-rate-card"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  getSuccessRateColor(healthStats?.successRate ?? null)
                )}
              />
              <span className="text-xs text-zinc-400 font-medium">
                Success Rate
              </span>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {isLoadingStats
                ? "..."
                : healthStats?.successRate !== null &&
                  healthStats?.successRate !== undefined
                ? `${healthStats.successRate}%`
                : "\u2014"}
            </p>
          </div>

          <div
            className={cn(
              "bg-zinc-50 rounded-xl p-4",
              "border border-zinc-100"
            )}
            data-testid="sequence-total-runs-card"
          >
            <span className="text-xs text-zinc-400 font-medium">
              Total Runs
            </span>
            <p className="text-2xl font-semibold text-zinc-900 mt-2">
              {isLoadingStats
                ? "..."
                : healthStats?.totalRuns ?? "\u2014"}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">last 7 days</p>
          </div>

          <div
            className={cn(
              "bg-zinc-50 rounded-xl p-4",
              "border border-zinc-100"
            )}
            data-testid="sequence-last-run-card"
          >
            <span className="text-xs text-zinc-400 font-medium">Last Run</span>
            <p className="text-sm font-semibold text-zinc-900 mt-2">
              {isLoadingStats
                ? "..."
                : healthStats?.lastRun
                ? dayjs(healthStats.lastRun.time).fromNow()
                : "\u2014"}
            </p>
            {healthStats?.lastRun && (
              <div className="flex items-center gap-1 mt-1">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    getStatusColor(healthStats.lastRun.status)
                  )}
                />
                <span className="text-[10px] text-zinc-400 capitalize">
                  {healthStats.lastRun.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewTab;
