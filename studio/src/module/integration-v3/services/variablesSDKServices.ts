import Variable from "oute-services-variable-sdk";
import getSDKConfig, { handleError } from "./baseConfig";

const getVariableInstance = () => {
  return new Variable(getSDKConfig());
};

export const variableSDKServices = {
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
