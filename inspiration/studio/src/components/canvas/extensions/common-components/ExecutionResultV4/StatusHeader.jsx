import React from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return timestamp;
  }
};

const StatusHeader = ({ hasError, nodeName, theme = {}, executedAt }) => {
  const accentColor = theme.accentColor || "#3b82f6";

  return (
    <div className={styles.statusHeader}>
      <div className={styles.statusLeft}>
        <div
          className={cn(
            styles.statusBadge,
            hasError ? styles.statusError : styles.statusSuccess
          )}
        >
          {hasError ? (
            <>
              <XCircle className="w-4 h-4" />
              <span>Error</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Success</span>
            </>
          )}
        </div>
        <span className={styles.nodeName}>{nodeName}</span>
      </div>

      <div className={styles.statusRight}>
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className={styles.timestamp}>{formatTimestamp(executedAt)}</span>
      </div>
    </div>
  );
};

export default StatusHeader;
