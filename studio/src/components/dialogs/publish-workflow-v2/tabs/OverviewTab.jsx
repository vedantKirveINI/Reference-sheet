import { useMemo, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Zap, Clock, Copy, CheckCircle2, ExternalLink, ArrowRight } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "sonner";
import {
  extractTriggerNodes,
  formatTimeBasedTriggerDescription,
  formatSheetTriggerDescription,
  formatFormTriggerDescription,
  formatSheetDateFieldTriggerDescription,
} from "../../publish/workflow/utils/trigger-utils";
import ValidationSummary from "../components/ValidationSummary";
import {
  WEBHOOK_TYPE,
  TIME_BASED_TRIGGER,
  INPUT_SETUP_TYPE,
  SHEET_TRIGGER,
  FORM_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
  INTEGRATION_TYPE,
  HTTP_TYPE,
  TRANSFORMER_TYPE,
} from "../../../canvas/extensions";
import flowExecutionServices from "../../../../sdk-services/flow-execution-sdk-services";

dayjs.extend(relativeTime);

const getTriggerDescription = (node, assetDetails) => {
  const nodeType = node?.type || node?.data?.type;
  const nodeSubType = node?.subType || node?.data?.subType;
  const goData =
    node?.data?.goData ||
    node?.data?.go_data ||
    node?.goData ||
    node?.go_data ||
    {};

  if (nodeType === WEBHOOK_TYPE) {
    return "Starts when it receives data from an external service";
  }

  if (nodeType === TIME_BASED_TRIGGER) {
    const desc = formatTimeBasedTriggerDescription(goData);
    return `Starts — ${desc}`;
  }

  if (nodeType === SHEET_TRIGGER) {
    const desc = formatSheetTriggerDescription(goData);
    return `Starts when ${desc.replace("Triggers when ", "")}`;
  }

  if (nodeType === FORM_TRIGGER) {
    const desc = formatFormTriggerDescription(goData);
    return `Starts when ${desc.replace("Triggers when ", "")}`;
  }

  if (nodeType === SHEET_DATE_FIELD_TRIGGER) {
    const desc = formatSheetDateFieldTriggerDescription(goData);
    return `Starts when ${desc}`;
  }

  if (nodeType === INPUT_SETUP_TYPE) {
    return "Starts when you run it manually";
  }

  if (nodeType === INTEGRATION_TYPE && nodeSubType === "TRIGGER_SETUP") {
    const triggerName = node?.name || node?.data?.name || "";
    return triggerName
      ? `Starts when ${triggerName} sends an event`
      : "Starts when an app sends an event";
  }

  return "Trigger configured";
};

const getWebhookUrl = (node, assetDetails) => {
  const goData =
    node?.data?.goData ||
    node?.data?.go_data ||
    node?.goData ||
    node?.go_data ||
    {};
  const publishedUrl =
    assetDetails?.asset?.published_info?.details?.asset?.url;
  return (
    publishedUrl ||
    goData?.webhookData?.webhook_url ||
    goData?.webhookData?.webhookUrl ||
    goData?.webhook_url ||
    goData?.webhookUrl ||
    null
  );
};

const getNodeLabel = (node) => {
  const nodeType = node?.type || node?.data?.type;
  const name = node?.name || node?.data?.name;

  if (name) return name;

  switch (nodeType) {
    case HTTP_TYPE:
      return "HTTP Request";
    case INTEGRATION_TYPE:
      return "Integration";
    case TRANSFORMER_TYPE:
      return "Transform Data";
    default:
      return nodeType || "Step";
  }
};

const OverviewTab = ({ nodes = [], assetDetails = {}, validationData = null, onFixNow = () => { } }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [healthStats, setHealthStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const isPublished = !!assetDetails?.asset?.published_info?.published_at;
  const workspaceId = assetDetails?.workspace_id;
  const assetId = assetDetails?.asset?._id || assetDetails?.asset_id;

  const triggerNodes = useMemo(() => extractTriggerNodes(nodes), [nodes]);

  const actionNodes = useMemo(() => {
    if (!Array.isArray(nodes)) return [];
    return nodes.filter((node) => {
      const nodeType = node?.type || node?.data?.type;
      const nodeSubType = node?.subType || node?.data?.subType;
      if (
        [
          WEBHOOK_TYPE,
          TIME_BASED_TRIGGER,
          INPUT_SETUP_TYPE,
          SHEET_TRIGGER,
          FORM_TRIGGER,
          SHEET_DATE_FIELD_TRIGGER,
        ].includes(nodeType)
      ) {
        return false;
      }
      if (nodeType === INTEGRATION_TYPE && nodeSubType === "TRIGGER_SETUP") {
        return false;
      }
      return true;
    });
  }, [nodes]);

  const fetchHealthStats = useCallback(async () => {
    if (!workspaceId || !assetId || !isPublished) return;

    setIsLoadingStats(true);
    try {
      const sevenDaysAgo = dayjs().subtract(7, "day").toISOString();
      const response = await flowExecutionServices.getList({
        workspace_id: workspaceId,
        asset_id: assetId,
        limit: 100,
        page: 1,
      });


      if (response?.status === "success") {
        const executions = response?.result?.docs || [];
        const recentExecutions = executions.filter(
          (e) => dayjs(e.start_at).isAfter(dayjs().subtract(7, "day"))
        );
        const succeeded = recentExecutions.filter(
          (e) => e.execution_state === "SUCCESS" || e.status === "success" || e.status === "completed"
        ).length;
        const failed = recentExecutions.filter(
          (e) => e.execution_state === "FAILED" || e.status === "failed" || e.status === "error"
        ).length;
        const total = recentExecutions.length;
        const successRate = total > 0 ? Math.round((succeeded / total) * 100) : null;
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

  const handleCopyUrl = useCallback((url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  }, []);

  const triggerNode = triggerNodes.length > 0 ? triggerNodes[0] : null;
  const triggerType = triggerNode
    ? triggerNode?.type || triggerNode?.data?.type
    : null;
  const webhookUrl =
    triggerType === WEBHOOK_TYPE
      ? getWebhookUrl(triggerNode, assetDetails)
      : null;

  const displayNodes = actionNodes.slice(0, 6);
  const remainingCount = Math.max(0, actionNodes.length - 6);

  const getSuccessRateColor = (rate) => {
    if (rate === null) return "bg-zinc-300";
    if (rate > 90) return "bg-emerald-500";
    if (rate >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusColor = (status) => {
    if (status === "success" || status === "completed") return "bg-emerald-500";
    if (status === "failed" || status === "error") return "bg-red-500";
    return "bg-amber-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5 py-1"
      data-testid="workflow-overview-tab"
    >
      {validationData && (
        <ValidationSummary
          issues={validationData.issues}
          totalErrors={validationData.totalErrors}
          totalWarnings={validationData.totalWarnings}
          isClean={validationData.isClean}
          onFixNow={onFixNow}
        />
      )}

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
                {triggerNode
                  ? getTriggerDescription(triggerNode, assetDetails)
                  : "No trigger set up yet — this workflow runs manually"}
              </p>
              {webhookUrl && (
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1 min-w-0 bg-white rounded-lg border border-zinc-100 px-3 py-1.5">
                    <p
                      className="text-xs text-zinc-500 font-mono truncate"
                      data-testid="webhook-url-display"
                    >
                      {webhookUrl}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyUrl(webhookUrl)}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg",
                      "bg-white border border-zinc-100",
                      "text-zinc-400 hover:text-zinc-600 hover:border-zinc-200",
                      "transition-all duration-150"
                    )}
                    data-testid="copy-webhook-url-btn"
                  >
                    {copiedUrl ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {actionNodes.length > 0 && (
        <div data-testid="then-does-section">
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2.5 px-1">
            Then does...
          </h4>
          <div className="flex flex-wrap gap-2" data-testid="action-nodes-list">
            {displayNodes.map((node, idx) => (
              <div
                key={idx}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5",
                  "bg-zinc-50 rounded-lg",
                  "border border-zinc-100"
                )}
                data-testid={`action-node-pill-${idx}`}
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
                data-testid="action-nodes-overflow"
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
        <div className="grid grid-cols-3 gap-3" data-testid="health-metrics-grid">
          <div
            className={cn(
              "bg-zinc-50 rounded-xl p-4",
              "border border-zinc-100"
            )}
            data-testid="success-rate-card"
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
                  : "—"}
            </p>
          </div>

          <div
            className={cn(
              "bg-zinc-50 rounded-xl p-4",
              "border border-zinc-100"
            )}
            data-testid="total-runs-card"
          >
            <span className="text-xs text-zinc-400 font-medium">
              Total Runs
            </span>
            <p className="text-2xl font-semibold text-zinc-900 mt-2">
              {isLoadingStats
                ? "..."
                : healthStats?.totalRuns ?? "—"}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">last 7 days</p>
          </div>

          <div
            className={cn(
              "bg-zinc-50 rounded-xl p-4",
              "border border-zinc-100"
            )}
            data-testid="last-run-card"
          >
            <span className="text-xs text-zinc-400 font-medium">Last Run</span>
            <p className="text-sm font-semibold text-zinc-900 mt-2">
              {isLoadingStats
                ? "..."
                : healthStats?.lastRun
                  ? dayjs(healthStats.lastRun.time).fromNow()
                  : "—"}
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
