import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Settings,
  AlertCircle,
  Ban,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const NODE_STATUSES = {
  CONFIGURED: "configured",
  NEEDS_SETUP: "needs_setup",
  DISABLED: "disabled",
  ERROR: "error",
  WARNING: "warning",
  RUNNING: "running",
  SUCCESS: "success",
  PENDING: "pending",
};

export const STATUS_CONFIG = {
  [NODE_STATUSES.CONFIGURED]: {
    icon: CheckCircle,
    color: "#6366F1",
    bgColor: "#EEF2FF",
    label: "Configured",
    description: "Node is fully configured",
  },
  [NODE_STATUSES.NEEDS_SETUP]: {
    icon: Settings,
    color: "#F97316",
    bgColor: "#FFF7ED",
    label: "Needs Setup",
    description: "Configuration required",
  },
  [NODE_STATUSES.DISABLED]: {
    icon: Ban,
    color: "#6B7280",
    bgColor: "#F3F4F6",
    label: "Disabled",
    description: "Node is disabled",
  },
  [NODE_STATUSES.ERROR]: {
    icon: XCircle,
    color: "#EF4444",
    bgColor: "#FEF2F2",
    label: "Error",
    description: "Node has errors",
  },
  [NODE_STATUSES.WARNING]: {
    icon: AlertTriangle,
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    label: "Warning",
    description: "Node has warnings",
  },
  [NODE_STATUSES.RUNNING]: {
    icon: Loader2,
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    label: "Running",
    description: "Node is executing",
    animate: true,
  },
  [NODE_STATUSES.SUCCESS]: {
    icon: CheckCircle,
    color: "#22C55E",
    bgColor: "#F0FDF4",
    label: "Success",
    description: "Execution successful",
  },
  [NODE_STATUSES.PENDING]: {
    icon: AlertCircle,
    color: "#9CA3AF",
    bgColor: "#F9FAFB",
    label: "Pending",
    description: "Not yet executed",
  },
};

export function getNodeStatus(nodeData) {
  if (nodeData._state === "running") return NODE_STATUSES.RUNNING;
  if (nodeData.disabled) return NODE_STATUSES.DISABLED;
  if (nodeData.errors?.length > 0) return NODE_STATUSES.ERROR;
  if (nodeData.warnings?.length > 0) return NODE_STATUSES.WARNING;
  if (nodeData._executionResult?.success === true) return NODE_STATUSES.SUCCESS;
  if (nodeData._executionResult?.success === false) return NODE_STATUSES.ERROR;
  if (nodeData.go_data) return NODE_STATUSES.CONFIGURED;
  if (nodeData.type) return NODE_STATUSES.NEEDS_SETUP;
  return NODE_STATUSES.PENDING;
}

export function NodeStatusBadge({ status, size = "sm", showLabel = false }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const Icon = config.icon;
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full",
              showLabel && "px-2 py-0.5"
            )}
            style={{ backgroundColor: showLabel ? config.bgColor : "transparent" }}
          >
            <motion.div
              animate={config.animate ? { rotate: 360 } : {}}
              transition={
                config.animate
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : {}
              }
            >
              <Icon
                className={sizeClasses[size]}
                style={{ color: config.color }}
              />
            </motion.div>
            {showLabel && (
              <span
                className="text-xs font-medium"
                style={{ color: config.color }}
              >
                {config.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{config.label}</p>
          <p className="text-gray-500">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function NodeStatusBorder({ status, children, className }) {
  const config = STATUS_CONFIG[status];
  if (!config) return children;

  return (
    <div
      className={cn("relative", className)}
      style={{
        boxShadow: `0 0 0 2px ${config.color}20`,
        borderRadius: "inherit",
      }}
    >
      {children}
      {status === NODE_STATUSES.RUNNING && (
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{
            border: `2px solid ${config.color}`,
            borderRadius: "inherit",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

export function NodeStatusFilter({ selectedStatuses, onStatusChange, counts }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(STATUS_CONFIG).map(([status, config]) => {
        const count = counts?.[status] || 0;
        const isSelected = selectedStatuses.includes(status);
        const Icon = config.icon;

        return (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
              "border transition-all duration-150",
              isSelected
                ? "border-current bg-opacity-10"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            )}
            style={{
              color: isSelected ? config.color : undefined,
              backgroundColor: isSelected ? config.bgColor : undefined,
            }}
          >
            <Icon className="w-3 h-3" />
            <span>{config.label}</span>
            {count > 0 && (
              <span className="text-[10px] opacity-70">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function getStatusBorderColor(status) {
  return STATUS_CONFIG[status]?.color || STATUS_CONFIG[NODE_STATUSES.PENDING].color;
}
