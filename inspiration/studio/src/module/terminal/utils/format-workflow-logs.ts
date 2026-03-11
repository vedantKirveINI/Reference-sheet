import {
  ABORT_FLOW_ERROR_KEY,
  ABORT_FLOW_RESULT_KEY,
  BEGIN_NODE_KEY,
  END_NODE_KEY,
  EXECUTE_FLOW_ERROR_KEY,
  EXECUTE_FLOW_INIT,
  EXECUTE_FLOW_RESULT_KEY,
  NODE_INPUT_KEY,
  NODE_ERROR_KEY,
  NODE_LOG_KEY,
  NODE_OUTPUT_KEY,
  POST_LOG_TYPE,
  PRE_LOG_TYPE,
  EXECUTE_NODE_ERROR_KEY,
  EXECUTE_NODE_RESULT_KEY,
} from "../constant";
import {
  formatTimeDifference,
  formatTimeFromMs,
} from "./format-time-difference";
import { LogType, TerminalLogData, WorkflowLogEventData } from "../types";
import { getCurrentTime } from ".";

const LOG_TYPE: Record<string, LogType> = {
  INFO: "info",
  SUCCESS: "success",
  ERROR: "error",
  ABORTED: "aborted",
};

const MESSAGE_MAPPING = {
  [BEGIN_NODE_KEY]: "The node has started",
  [END_NODE_KEY]: "The node has finished",
  [NODE_INPUT_KEY]: "The node has received input",
  [NODE_OUTPUT_KEY]: "The node has sent output",
  [NODE_ERROR_KEY]: "The node has errored",
  [NODE_LOG_KEY]: "The node has logged",
  [EXECUTE_NODE_ERROR_KEY]: "The execution process completed.", // as discusse with sattu
  [EXECUTE_NODE_RESULT_KEY]: "The execution process completed.", // as discusse with sattu
  [EXECUTE_FLOW_RESULT_KEY]: "The execution process completed.", // as discusse with sattu
  [EXECUTE_FLOW_ERROR_KEY]: "The execution process completed.", // as discusse with sattu
  [ABORT_FLOW_RESULT_KEY]: "The flow has been aborted",
  [ABORT_FLOW_ERROR_KEY]: "The flow has errored",
  [EXECUTE_FLOW_INIT]: "The flow has started",
};

const dataTransformer = (data: any) => {
  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      if (data?.length === 0) return "Empty Array";
    }
    if (Object.keys(data)?.length === 0) return "Empty Object";
  }

  if (typeof data === "string") {
    if (data?.length === 0) return "Empty String";
    return data;
  }

  if (typeof data === "undefined") {
    return "undefined";
  }

  if (data === null) {
    return "null";
  }

  if (typeof data === "boolean") {
    return data?.toString();
  }

  return data;
};

const createLogEntry = ({
  data,
  logType = LOG_TYPE.INFO,
  node_name,
  node_type,
  event_name = "",
  created_at,
}): TerminalLogData => ({
  timestamp: getCurrentTime(created_at),
  message: MESSAGE_MAPPING[event_name],
  logEventName: node_name || node_type,
  data: dataTransformer(data),
  type: logType,
  executionTime: null,
});

const eventHandlers = {
  [EXECUTE_FLOW_INIT]: (data: WorkflowLogEventData) => {
    const log = createLogEntry({
      ...data,
      data: undefined,
      node_name: "Initialization",
      logType: LOG_TYPE.INFO,
    });
    log.data = undefined;
    return log;
  },
  [BEGIN_NODE_KEY]: (data: WorkflowLogEventData) => {
    const log = createLogEntry({
      ...data,
      data: undefined,
      node_name: data?.node_name,
      node_type: data?.node_type,
    });
    log.data = undefined;
    return log;
  },
  [END_NODE_KEY]: (data: WorkflowLogEventData) => {
    const log = createLogEntry({
      ...data,
      data: undefined,
      node_name: data?.node_name,
      node_type: data?.node_type,
    });
    log.data = undefined;
    return log;
  },
  [NODE_INPUT_KEY]: (data: WorkflowLogEventData) => {
    const log = createLogEntry({
      ...data,
      node_name: data?.node_name,
      node_type: data?.node_type,
    });
    return log;
  },
  [NODE_OUTPUT_KEY]: (data: WorkflowLogEventData) => {
    const log = createLogEntry({
      ...data,
      node_name: data?.node_name,
      node_type: data?.node_type,
      logType: LOG_TYPE.SUCCESS,
    });
    return log;
  },
  [NODE_ERROR_KEY]: (data: WorkflowLogEventData) =>
    createLogEntry({
      ...data,
      node_name: data?.node_name,
      node_type: data?.node_type,
      logType: LOG_TYPE.ERROR,
    }),
  [NODE_LOG_KEY]: (data: WorkflowLogEventData) =>
    createLogEntry({
      ...data,
      node_name: data?.node_name,
      node_type: data?.node_type,
    }),
  [EXECUTE_NODE_ERROR_KEY]: (data: WorkflowLogEventData) =>
    createLogEntry({
      ...data,
      data: { message: "Process ended" },
      node_name: "Execution Completed",
      node_type: data?.node_type,
    }),
  [EXECUTE_NODE_RESULT_KEY]: (data: WorkflowLogEventData) =>
    createLogEntry({
      ...data,
      data: { message: "Process ended" },
      node_name: "Execution Completed",
      node_type: data?.node_type,
      logType: LOG_TYPE.SUCCESS,
    }),
  [EXECUTE_FLOW_RESULT_KEY]: (data: WorkflowLogEventData) =>
    createLogEntry({
      ...data,
      data: { message: "Process ended" },
      node_name: "Execution Completed",
      logType: LOG_TYPE.SUCCESS,
    }),
  [EXECUTE_FLOW_ERROR_KEY]: (data: WorkflowLogEventData) =>
    createLogEntry({
      ...data,
      data: { message: "Process ended" },
      node_name: "Execution Completed",
      node_type: "Execution Completed",
    }),
  [ABORT_FLOW_RESULT_KEY]: (data: WorkflowLogEventData) =>
    createLogEntry({
      ...data,
      node_name: "Abort Flow Result",
      logType: LOG_TYPE.ABORTED,
    }),
  [ABORT_FLOW_ERROR_KEY]: (data: WorkflowLogEventData) =>
    createLogEntry({
      ...data,
      node_name: "Abort Flow Error",
      logType: LOG_TYPE.ERROR,
    }),
};

export const formatSingleLog = (eventData: WorkflowLogEventData) => {
  const handler = eventHandlers[eventData?.event_name];
  if (handler) {
    const log = handler(eventData);
    if (eventData.event_name === END_NODE_KEY) {
      if (eventData?.duration_ms >= 0) {
        log.executionTime = formatTimeFromMs(eventData?.duration_ms);
      }
    }
    return log;
  }
  return null;
};

export const formatEventsDataInLogsData = (
  eventsData: WorkflowLogEventData[]
): TerminalLogData[] => {
  let logsData = [];
  const hashedPreviousBeginNodeData = {};
  for (const eventData of eventsData) {
    const handler = eventHandlers[eventData.event_name];
    if (eventData.event_name === BEGIN_NODE_KEY) {
      hashedPreviousBeginNodeData[eventData?.node_id] = eventData;
    }
    if (handler) {
      const log = handler(eventData); //   const logExecutionTime = eventData;
      if (eventData.event_name === END_NODE_KEY) {
        if (eventData?.duration_ms >= 0) {
          log.executionTime = formatTimeFromMs(eventData?.duration_ms);
        } else {
          log.executionTime = formatTimeDifference(
            hashedPreviousBeginNodeData[eventData?.node_id]?.created_at,
            eventData?.created_at
          );
        }
        hashedPreviousBeginNodeData[eventData?.node_id] = null;
      }
      logsData.push(log);
    }
  }
  return logsData;
};
