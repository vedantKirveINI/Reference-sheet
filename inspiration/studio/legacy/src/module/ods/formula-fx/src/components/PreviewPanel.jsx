import React, { useState } from "react";
import classes from "./PreviewPanel.module.css";

const PreviewPanel = ({ result, content = [], onFixWithAI = () => {}, compact = false }) => {
  const hasContent = content && content.length > 0;
  const [isFixing, setIsFixing] = useState(false);
  
  if (!hasContent) {
    return null;
  }

  const handleFixClick = async () => {
    setIsFixing(true);
    try {
      await onFixWithAI(result?.error);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className={`${classes.container} ${compact ? classes.compact : ""}`}>
      <div className={classes.header}>
        <span className={classes.title}>PREVIEW</span>
        {result?.success && (
          <span className={classes.typeBadge}>{result.type || "string"}</span>
        )}
      </div>
      <div className={classes.content}>
        {result?.success ? (
          <div className={classes.result}>
            <span className={classes.resultLabel}>Result:</span>
            <code className={classes.resultValue}>
              {typeof result.value === "object"
                ? JSON.stringify(result.value, null, 2)
                : String(result.value)}
            </code>
          </div>
        ) : result?.error ? (
          <div className={classes.errorSection}>
            <div className={classes.error}>
              <span className={classes.errorIcon}>⚠</span>
              <span className={classes.errorMessage}>{result.error}</span>
            </div>
            <button 
              className={classes.fixButton} 
              onClick={handleFixClick}
              disabled={isFixing}
            >
              {isFixing ? (
                <>
                  <span className={classes.spinner}></span>
                  Fixing...
                </>
              ) : (
                <>
                  <span className={classes.aiIcon}>✨</span>
                  Fix with AI
                </>
              )}
            </button>
          </div>
        ) : (
          <div className={classes.pending}>
            Enter a formula to see the preview
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
