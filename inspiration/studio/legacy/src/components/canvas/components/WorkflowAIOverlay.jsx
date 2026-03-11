import React from "react";
import PropTypes from "prop-types";
import styles from "./WorkflowAIOverlay.module.css";

const WorkflowAIOverlay = ({
  isVisible,
  status,
  step,
  retryCount,
  onRetry,
  hasError,
  errorMessage,
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay} data-testid="workflow-ai-overlay">
      <div className={styles.content}>
        {!hasError && (
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner} />
          </div>
        )}
        {hasError && (
          <div className={styles.errorIcon}>!</div>
        )}
        <div className={styles.statusText}>
          {hasError ? errorMessage || "An error occurred" : status}
        </div>
        {step === "executing" && retryCount > 0 && !hasError && (
          <div className={styles.retryBadge}>Repair attempt {retryCount}</div>
        )}
        {hasError && onRetry && (
          <button className={styles.retryButton} onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

WorkflowAIOverlay.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  status: PropTypes.string,
  step: PropTypes.oneOf(["idle", "planning", "executing"]),
  retryCount: PropTypes.number,
  onRetry: PropTypes.func,
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string,
};

WorkflowAIOverlay.defaultProps = {
  status: "",
  step: "idle",
  retryCount: 0,
  onRetry: null,
  hasError: false,
  errorMessage: "",
};

export default WorkflowAIOverlay;
