import FlowExecution from "oute-services-flow-exec-sdk";
import { getStudioServerConfig, handleError } from "./baseConfig";

const getFlowExecutionInstance = () =>
  new FlowExecution(getStudioServerConfig());

const flowExecutionServices = {
  getList: async (payload) => {
    try {
      const response = await getFlowExecutionInstance().getList(payload);
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
};

export default flowExecutionServices;
