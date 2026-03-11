import { Terminal } from "@oute/oute-ds.common.molecule.terminal";
import isEmpty from "lodash/isEmpty";
import { ODSLabel } from "@src/module/ods";
import classes from "../index.module.css";
import React from "react";

class LogsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
  }

  render() {
    if (this.state.hasError) {
      return (
        <ODSLabel
          variant="body2"
          style={{
            color: "#607D8B",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          Unable to display logs. Please try refreshing.
        </ODSLabel>
      );
    }

    return this.props.children;
  }
}

function Logs({
  isLoadingLogs,
  executionLogs,
  selectedExecution,
  setExecutionLogs,
}) {
  if (isLoadingLogs) {
    return (
      <ODSLabel
        variant="body2"
        style={{
          color: "#607D8B",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        Loading logs...
      </ODSLabel>
    );
  }

  if (!isEmpty(executionLogs)) {
    const safeLogs = Array.isArray(executionLogs) ? executionLogs : [];
    
    return (
      <LogsErrorBoundary>
        <div className={classes.terminalWrapper}>
          <Terminal
            logs={safeLogs}
            onClearTerminal={() => setExecutionLogs?.([])}
            verbose={true}
            onCollapseToggle={() => {}}
            title="Logs"
            showHeader={true}
            showClearTerminal={false}
            hasStreaming={false}
          />
        </div>
      </LogsErrorBoundary>
    );
  }

  if (selectedExecution) {
    return (
      <ODSLabel
        variant="body2"
        style={{
          color: "#607D8B",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        No logs available for this execution.
      </ODSLabel>
    );
  }
  return null;
}

export default Logs;
