import { CheckCircle2, XCircle, Clock } from "lucide-react";
import styles from "./StatusHeader.module.css";

function StatusHeader({ hasError, nodeName, theme = {}, executedAt }) {
  const accentColor = theme.accentColor || "#3b82f6";

  const formatTimestamp = () => {
    if (!executedAt) return "Just now";
    const now = new Date();
    const executed = new Date(executedAt);
    const diffMs = now - executed;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return executed.toLocaleTimeString();
  };
  
  return (
    <div className={styles.header}>
      <div 
        className={styles.statusBadge} 
        data-status={hasError ? "error" : "success"}
        style={!hasError ? { 
          background: `${accentColor}15`,
          color: accentColor
        } : undefined}
      >
        {hasError ? (
          <>
            <XCircle className={styles.statusIcon} />
            <span>Test Failed</span>
          </>
        ) : (
          <>
            <CheckCircle2 className={styles.statusIcon} />
            <span>Test Passed</span>
          </>
        )}
      </div>

      <div className={styles.meta}>
        <span className={styles.nodeName}>{nodeName}</span>
        <span className={styles.separator}>•</span>
        <Clock className={styles.clockIcon} />
        <span className={styles.timestamp}>{formatTimestamp()}</span>
      </div>
    </div>
  );
}

export default StatusHeader;
