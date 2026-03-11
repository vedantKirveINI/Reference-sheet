import Variable from "oute-services-variable-sdk";
import { handleError, getOuteServerConfig } from "./baseConfig";

const getVariableInstance = () => {
  return new Variable(getOuteServerConfig());
};
const variableSDKServices = {
  getByParent: async (data, canvas_data) => {
    try {
      const response = await getVariableInstance().getByParent(
        data,
        canvas_data,
      );
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  transformedToState: async (variable_obj) => {
    try {
      const response =
        await getVariableInstance().transformedToState(variable_obj);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};
export default variableSDKServices;
