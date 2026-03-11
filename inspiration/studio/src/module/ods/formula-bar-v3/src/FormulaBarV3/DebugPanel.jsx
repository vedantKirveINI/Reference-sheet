import React from 'react';
import classes from './DebugPanel.module.css';

const STATUS_ICONS = {
  success: '✓',
  error: '✗',
  skipped: '○',
};

const STATUS_COLORS = {
  success: '#34a853',
  error: '#ea4335',
  skipped: '#9b9a97',
};

const DebugStepRow = ({ step, depth = 0 }) => {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = step.children && step.children.length > 0;
  
  const statusIcon = STATUS_ICONS[step.status] || '?';
  const statusColor = STATUS_COLORS[step.status] || '#666';

  return (
    <div className={classes.stepContainer}>
      <div 
        className={`${classes.stepRow} ${step.status === 'error' ? classes.errorRow : ''}`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className={classes.expandIcon}>
            {expanded ? '▼' : '▶'}
          </span>
        )}
        <span 
          className={classes.statusIcon}
          style={{ color: statusColor }}
        >
          {statusIcon}
        </span>
        <span className={classes.stepLabel}>{step.label}</span>
        <span className={classes.stepType}>
          {step.inferredType}
          {step.nullable && <span className={classes.nullableIndicator}>?</span>}
        </span>
        {step.value !== null && step.value !== undefined && (
          <span className={classes.stepValue}>
            = {typeof step.value === 'object' ? JSON.stringify(step.value) : String(step.value)}
          </span>
        )}
      </div>
      {step.errorMessage && (
        <div 
          className={classes.errorMessage}
          style={{ paddingLeft: `${depth * 16 + 32}px` }}
        >
          {step.errorMessage}
        </div>
      )}
      {hasChildren && expanded && (
        <div className={classes.stepChildren}>
          {step.children.map((child, index) => (
            <DebugStepRow key={child?.nodeId || index} step={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const DebugPanel = ({ 
  debugResult,
  onClose,
  isLoading = false,
}) => {
  if (!debugResult && !isLoading) {
    return (
      <div className={classes.panel}>
        <div className={classes.header}>
          <span className={classes.title}>Debug</span>
          {onClose && (
            <button className={classes.closeButton} onClick={onClose}>×</button>
          )}
        </div>
        <div className={classes.emptyState}>
          Enter a formula to see debug information
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={classes.panel}>
        <div className={classes.header}>
          <span className={classes.title}>Debug</span>
          {onClose && (
            <button className={classes.closeButton} onClick={onClose}>×</button>
          )}
        </div>
        <div className={classes.emptyState}>
          Evaluating...
        </div>
      </div>
    );
  }

  const { success, value, errors, diagnostics, trace, rootStep } = debugResult;

  return (
    <div className={classes.panel}>
      <div className={classes.header}>
        <span className={classes.title}>Debug</span>
        <div className={classes.headerRight}>
          <span className={`${classes.statusBadge} ${success ? classes.successBadge : classes.errorBadge}`}>
            {success ? 'Success' : 'Error'}
          </span>
          {onClose && (
            <button className={classes.closeButton} onClick={onClose}>×</button>
          )}
        </div>
      </div>

      {!success && errors.length > 0 && (
        <div className={classes.errorsSection}>
          <div className={classes.sectionTitle}>Errors</div>
          {errors.map((error, index) => (
            <div key={index} className={classes.errorItem}>
              <span className={classes.errorIcon}>✗</span>
              {error}
            </div>
          ))}
        </div>
      )}

      {diagnostics && diagnostics.length > 0 && (
        <div className={classes.diagnosticsSection}>
          <div className={classes.sectionTitle}>Type Diagnostics</div>
          {diagnostics.map((diag, index) => (
            <div 
              key={index} 
              className={`${classes.diagItem} ${diag.severity === 'error' ? classes.diagError : classes.diagWarning}`}
            >
              <span className={classes.diagSeverity}>
                {diag.severity === 'error' ? '✗' : '⚠'}
              </span>
              <div className={classes.diagContent}>
                <div className={classes.diagMessage}>{diag.message}</div>
                {diag.suggestion && (
                  <div className={classes.diagSuggestion}>💡 {diag.suggestion}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {success && value !== null && value !== undefined && (
        <div className={classes.resultSection}>
          <div className={classes.sectionTitle}>Result</div>
          <div className={classes.resultValue}>
            {typeof value === 'object' ? (
              <pre>{JSON.stringify(value, null, 2)}</pre>
            ) : (
              String(value)
            )}
          </div>
        </div>
      )}

      {rootStep && (
        <div className={classes.traceSection}>
          <div className={classes.sectionTitle}>Execution Trace</div>
          <div className={classes.traceTree}>
            <DebugStepRow step={rootStep} depth={0} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
