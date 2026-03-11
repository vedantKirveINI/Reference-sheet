import { Terminal } from "@oute/oute-ds.common.molecule.terminal";
import isEmpty from "lodash/isEmpty";
// import ODSLabel from "oute-ds-label";
import { ODSLabel } from "@src/module/ods";
import classes from "../index.module.css";

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
        sx={{
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
    return (
      <div className={classes.terminalWrapper}>
        <Terminal
          logs={executionLogs}
          onClearTerminal={() => setExecutionLogs([])}
          verbose={true}
          onCollapseToggle={() => {}}
          title="Logs"
          showHeader={true}
          showClearTerminal={false}
          hasStreaming={false}
        />
      </div>
    );
  }

  if (selectedExecution) {
    return (
      <ODSLabel
        variant="body2"
        sx={{
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
