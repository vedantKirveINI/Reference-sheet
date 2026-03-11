import { useState, useEffect, useCallback } from "react";
import classes from "./index.module.css";
// import { ODSLabel } from "@src/module/ods";
// import { ODSAutocomplete } from "@src/module/ods";
// import { ODSTextField } from "@src/module/ods";
import { formatEventsDataInLogsData } from "@oute/oute-ds.common.molecule.terminal";
import flowExecutionServices from "../../../../../../sdk-services/flow-execution-sdk-services";
import flowExecutionLogsServices from "../../../../../../sdk-services/flow-execution-logs-sdk-services";
import { toast } from "sonner";
import { ODSLabel, ODSAutocomplete, ODSTextField } from "@src/module/ods";
import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
import Logs from "./components/Logs";
const HistoryTab = ({ assetDetails = {} }) => {
  const [executionHistoryList, setExecutionHistoryList] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const workspaceId = assetDetails?.workspace_id;
  const assetId = assetDetails?.asset?._id || assetDetails?.asset_id;

  const fetchWorkflowExecutionHistoryList = useCallback(async () => {
    if (!workspaceId || !assetId) {
      return;
    }

    setIsLoadingHistory(true);

    try {
      const response = await flowExecutionServices.getList({
        workspace_id: workspaceId,
        asset_id: assetId,
        limit: 100,
        page: 1,
      });

      if (response?.status === "success") {
        const executions = response?.result?.docs || [];
        setExecutionHistoryList(executions);

        if (executions.length > 0) {
          setSelectedExecution(executions[0]);
        }
      } else {
        toast.error("Unable to fetch execution history");
      }
    } catch {
      toast.error("Unable to fetch execution history");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [workspaceId, assetId]);

  const getExecutionLogs = useCallback(
    async (execution) => {
      if (!execution || !workspaceId || !assetId) {
        return;
      }

      setIsLoadingLogs(true);
      setExecutionLogs([]);

      try {
        const response = await flowExecutionLogsServices.getList({
          workspace_id: workspaceId,
          asset_id: assetId,
          batch_id: execution._id,
          sort_type: "asc",
          limit: 500,
          page: 1,
        });

        if (response?.status === "success") {
          const logs = response?.result?.docs || [];

          const formattedLogs = formatEventsDataInLogsData(logs);
          setExecutionLogs(formattedLogs);
        } else {
          setExecutionLogs([]);
        }
      } catch {
        setExecutionLogs([]);
      } finally {
        setIsLoadingLogs(false);
      }
    },
    [workspaceId, assetId],
  );

  useEffect(() => {
    fetchWorkflowExecutionHistoryList();
  }, [fetchWorkflowExecutionHistoryList]);

  useEffect(() => {
    if (selectedExecution) {
      getExecutionLogs(selectedExecution);
    }
  }, [selectedExecution, getExecutionLogs]);

  return (
    <div className={classes.tabContent} data-testid="workflow-history-tab">
      <div className={classes.historyContainer}>
        <div className={classes.historyHeader}>
          <ODSLabel
            variant="body1"
            style={{
              fontWeight: 600,
              color: "#263238",
              lineHeight: "2rem",
            }}
            data-testid="history-header-title"
          >
            Execution History
          </ODSLabel>
          <ODSLabel
            variant="body2"
            style={{ fontWeight: 400, color: "#607D8B", lineHeight: "1.25rem" }}
            data-testid="history-header-description"
          >
            View all past executions of this workflow
          </ODSLabel>
        </div>

        <div className={classes.historyContent}>
          {isEmpty(executionHistoryList) && !isLoadingHistory && (
            <div className={classes.emptyState}>
              <ODSLabel
                variant="body1"
                style={{
                  fontWeight: 400,
                  color: "#263238",
                  textAlign: "center",
                }}
                data-testid="history-empty-message"
              >
                Execution history will appear here once the workflow has been
                run.
              </ODSLabel>
              <ODSLabel
                variant="body2"
                style={{
                  fontWeight: 400,
                  color: "#607D8B",
                  textAlign: "center",
                }}
                data-testid="history-empty-description"
              >
                View detailed execution logs, inputs, outputs, and errors for
                each run.
              </ODSLabel>
            </div>
          )}

          {!isEmpty(executionHistoryList) && (
            <>
              <div className={classes.dropdownContainer}>
                <ODSLabel
                  variant="body2"
                  style={{
                    fontWeight: 500,
                    color: "#263238",
                    marginBottom: "0.5rem",
                  }}
                >
                  Select Execution
                </ODSLabel>

                <ODSAutocomplete
                  className="black"
                  options={executionHistoryList}
                  loading={isLoadingHistory}
                  value={selectedExecution}
                  onChange={(event, newValue) => {
                    setSelectedExecution(newValue);
                  }}
                  getOptionLabel={(option) =>
                    dayjs(option?.start_at)?.format("DD MMM, HH:mm:ss") || ""
                  }
                  isOptionEqualToValue={(option, value) => {
                    return option?._id === value?._id;
                  }}
                  renderInput={(params) => (
                    <ODSTextField
                      {...params}
                      placeholder="Select an execution"
                      data-testid="execution-history-dropdown-input"
                    />
                  )}
                  data-testid="execution-history-dropdown"
                />
              </div>

              <div className={classes.logsContainer}>
                <Logs
                  isLoadingLogs={isLoadingLogs}
                  executionLogs={executionLogs}
                  selectedExecution={selectedExecution}
                  setExecutionLogs={setExecutionLogs}
                />
              </div>
            </>
          )}

          {isLoadingHistory && (
            <div className={classes.emptyState}>
              <ODSLabel
                variant="body2"
                style={{
                  color: "#607D8B",
                  textAlign: "center",
                }}
              >
                Loading execution history...
              </ODSLabel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;
