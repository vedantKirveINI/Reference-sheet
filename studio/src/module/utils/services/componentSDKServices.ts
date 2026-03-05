import Component from "oute-services-component-sdk";
import getSDKConfig, { handleError } from "./baseConfig";

const getComponentInstance = () => {
  return new Component(getSDKConfig());
};

export const componentSDKServices = {
  variableAsFormSchema: async (config = {}) => {
    try {
      const response =
        await getComponentInstance().variableAsFormSchema(config);
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
  formSchemaToState: async (schema = {}) => {
    try {
      const response = await getComponentInstance().formSchemaToState(schema);
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
  executeTransformedNode: async (body) => {
    try {
      const response =
        await getComponentInstance().executeTransformedNode(body);
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
};
