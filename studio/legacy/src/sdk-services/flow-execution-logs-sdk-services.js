import FlowExecutionLogs from "oute-services-flow-exec-logs-sdk";
import { getStudioServerConfig, handleError } from "./baseConfig";

const getFlowExecutionLogsInstance = () =>
  new FlowExecutionLogs(getStudioServerConfig());

const flowExecutionLogsServices = {
  getList: async (payload) => {
    try {
      const response = await getFlowExecutionLogsInstance().getList(payload);
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
};

export default flowExecutionLogsServices;

