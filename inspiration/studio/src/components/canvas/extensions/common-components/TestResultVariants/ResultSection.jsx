import React, { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ResultSection = ({
  icon: Icon,
  title,
  subtitle,
  accentColor = "#3b82f6",
  children,
  defaultExpanded = true,
  collapsible = true,
  variant = "default",
  badge,
  actions,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const variantStyles = {
    default: {
      bg: "bg-background",
      border: "border-border/50",
      headerBg: `${accentColor}08`,
      iconBg: `${accentColor}15`,
    },
    success: {
      bg: "bg-emerald-50/50",
      border: "border-emerald-200/50",
      headerBg: "rgba(16, 185, 129, 0.08)",
      iconBg: "rgba(16, 185, 129, 0.15)",
    },
    error: {
      bg: "bg-red-50/50",
      border: "border-red-200/50",
      headerBg: "rgba(239, 68, 68, 0.08)",
      iconBg: "rgba(239, 68, 68, 0.15)",
    },
    info: {
      bg: "bg-blue-50/50",
      border: "border-blue-200/50",
      headerBg: "rgba(59, 130, 246, 0.08)",
      iconBg: "rgba(59, 130, 246, 0.15)",
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden w-full min-w-0 max-w-full",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        styles.bg,
        styles.border
      )}
    >
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between gap-3",
          collapsible && "cursor-pointer select-none",
          "border-b border-border/30"
        )}
        style={{ backgroundColor: styles.headerBg }}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {Icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: styles.iconBg }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: variant === "default" ? accentColor : undefined }}
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {title}
              </span>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 break-all min-w-0">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          {collapsible && (
            <div className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 min-w-0 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};

export default ResultSection;
