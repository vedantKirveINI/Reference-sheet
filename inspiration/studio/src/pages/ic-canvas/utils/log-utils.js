import dayjs from "dayjs";
import {
  SOCKET_ABORT_FLOW_ERROR_KEY,
  SOCKET_ABORT_FLOW_RESULT_KEY,
  SOCKET_BEGIN_NODE_KEY,
  SOCKET_END_NODE_KEY,
  SOCKET_EXECUTE_FLOW_ERROR_KEY,
  SOCKET_EXECUTE_FLOW_INIT_KEY,
  SOCKET_EXECUTE_FLOW_RESULT_KEY,
  SOCKET_NODE_INPUT_KEY,
  SOCKET_NODE_LOG_KEY,
  SOCKET_NODE_OUTPUT_KEY,
  SOCKET_POST_LOG_TYPE,
  SOCKET_PRE_LOG_TYPE,
} from "../../../constants/keys";
import isString from "lodash/isString";
export const formatDataForEventLog = (data) => {
  const getTime = () => {
    return dayjs().format("DD-MM-YYYY | HH:mm:ss");
  };
  const formatMessage = (message, data) => {
    if (isString(message)) {
      return `${data?.node_name || ""} ${data?.node_type ? `(${data?.node_type})` : ""} : ${message}`;
    }
    return message;
  };
  const createLogData = (data, logType = "info", isVerbose = false) => {
    return {
      created_at: getTime(),
      message: formatMessage(data?.result, data),
      messageType: isString(data?.result || "") ? "" : "json",
      type: logType,
      isVerbose,
    };
  };
  switch (data.event) {
    case SOCKET_EXECUTE_FLOW_INIT_KEY:
      return [
        createLogData({ ...data, node_name: "Initialization" }, "info", true),
      ];
    case SOCKET_BEGIN_NODE_KEY:
      return [{ type: "divider" }, createLogData(data)];
    case SOCKET_END_NODE_KEY:
      return [createLogData(data), { type: "divider" }];
    case SOCKET_NODE_INPUT_KEY:
      return [createLogData(data, null, true)];
    case SOCKET_NODE_OUTPUT_KEY:
      return [createLogData(data, null, true)];
    case SOCKET_NODE_LOG_KEY:
      if (data.type === SOCKET_PRE_LOG_TYPE) {
        return [createLogData(data)];
      } else if (data.type === SOCKET_POST_LOG_TYPE) {
        return [createLogData(data)];
      }
      return [];
    case SOCKET_EXECUTE_FLOW_RESULT_KEY:
      return [createLogData(data, "success", true)];
    case SOCKET_EXECUTE_FLOW_ERROR_KEY:
      return [createLogData(data, "error", true)];
    case SOCKET_ABORT_FLOW_RESULT_KEY:
      return [createLogData(data, "aborted", true)];
    case SOCKET_ABORT_FLOW_ERROR_KEY:
      return [createLogData(data, "error", true)];
    default:
      return [createLogData(data, "error", true)];
  }
};
