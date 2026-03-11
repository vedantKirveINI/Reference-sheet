import React, { useState, useCallback } from "react";
import { AlertTriangle, CheckCircle2, XCircle, Loader2, Eye, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

const DryRunPreview = ({
  isLoading = false,
  previewData = null,
  error = null,
  onConfirm,
  onCancel,
  onRetry,
  theme = {},
  operationType = "delete",
}) => {
  const accentColor = theme.accentColor || "#3b82f6";

  const getOperationConfig = () => {
    switch (operationType) {
      case "delete":
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          title: "Confirm Delete Operation",
          description: "The following records will be permanently deleted:",
          confirmLabel: "Delete Records",
          confirmVariant: "destructive",
          color: "#ef4444",
        };
      case "update":
        return {
          icon: <Eye className="w-5 h-5" />,
          title: "Preview Update Operation",
          description: "The following records will be updated:",
          confirmLabel: "Apply Updates",
          confirmVariant: "default",
          color: "#f59e0b",
        };
      default:
        return {
          icon: <Eye className="w-5 h-5" />,
          title: "Preview Operation",
          description: "The following changes will be made:",
          confirmLabel: "Confirm",
          confirmVariant: "default",
          color: accentColor,
        };
    }
  };

  const config = getOperationConfig();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className={styles.loadingText}>Generating preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <XCircle className="w-8 h-8 text-red-500" />
          <div className={styles.errorContent}>
            <p className={styles.errorTitle}>Preview Failed</p>
            <p className={styles.errorMessage}>{error}</p>
          </div>
          <div className={styles.errorActions}>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try Again
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Eye className="w-8 h-8 text-muted-foreground" />
          <p className={styles.emptyText}>No preview data available</p>
        </div>
      </div>
    );
  }

  const { affectedRows = 0, sample = [], summary = null } = previewData;

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{ "--operation-color": config.color }}
      >
        <div className={styles.headerIcon}>{config.icon}</div>
        <div className={styles.headerContent}>
          <h3 className={styles.headerTitle}>{config.title}</h3>
          <p className={styles.headerDescription}>{config.description}</p>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Affected Records</span>
          <span
            className={styles.summaryValue}
            style={{ color: config.color }}
          >
            {affectedRows}
          </span>
        </div>
        {summary && (
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Summary</span>
            <span className={styles.summaryText}>{summary}</span>
          </div>
        )}
      </div>

      {sample.length > 0 && (
        <div className={styles.previewTable}>
          <div className={styles.tableHeader}>
            <span>Sample Records (showing {Math.min(sample.length, 5)})</span>
          </div>
          <div className={styles.tableContent}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {Object.keys(sample[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sample.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((value, vidx) => (
                      <td key={vidx}>
                        {value === null
                          ? "null"
                          : typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sample.length > 5 && (
            <div className={styles.tableFooter}>
              <span>... and {sample.length - 5} more records</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.warningBanner}>
        <AlertTriangle className="w-4 h-4" />
        <span>This action cannot be undone. Please review carefully before proceeding.</span>
      </div>

      <div className={styles.actions}>
        <Button
          variant="outline"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          variant={config.confirmVariant}
          onClick={onConfirm}
          className={styles.confirmButton}
          style={{
            "--confirm-color": config.color,
          }}
        >
          <Play className="w-4 h-4 mr-1.5" />
          {config.confirmLabel}
        </Button>
      </div>
    </div>
  );
};

export default DryRunPreview;
