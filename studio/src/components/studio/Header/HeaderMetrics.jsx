import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MODE_CONFIG } from "./config";
import { MODE } from "../../../constants/mode";

const MetricItem = ({ label, value, compact }) => (
  <Badge
    variant="secondary"
    className={cn(
      "flex items-center gap-1.5 border-0 font-normal",
      compact ? "px-2 text-xs" : "px-3 text-sm"
    )}
  >
    <span className="font-semibold text-foreground">
      {typeof value === "number" ? value.toLocaleString() : value}
    </span>
    <span className="lowercase text-muted-foreground">{label}</span>
  </Badge>
);

const HeaderMetrics = ({
  mode,
  metrics = {},
  compact,
  className,
}) => {
  const config = MODE_CONFIG[mode] || MODE_CONFIG[MODE.WORKFLOW_CANVAS];

  if (!config.showMetrics) return null;

  const metricItems = [];

  if (metrics.today !== undefined) {
    metricItems.push({ label: "today", value: metrics.today });
  }
  if (metrics.successRate !== undefined) {
    metricItems.push({ label: "success", value: `${metrics.successRate}%` });
  }

  if (metricItems.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        compact && "gap-1 rounded-full bg-muted/50 px-2 py-1",
        className
      )}
      data-testid="header-metrics"
    >
      {metricItems.map((item, index) => (
        <MetricItem key={index} label={item.label} value={item.value} compact={compact} />
      ))}
    </div>
  );
};

export default HeaderMetrics;
