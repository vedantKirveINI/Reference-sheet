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
    }
  },
  formSchemaToState: async (schema = {}) => {
    try {
      const response = await getComponentInstance().formSchemaToState(schema);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  executeNode: async (type, config, state, asset_config) => {
    try {
      const response = await getComponentInstance().executeNode(
        type,
        config,
        state,
        asset_config
      );
      return response;
    } catch (error) {
      handleError(error);
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
  generateFormSchemaV2: async (body, options = {}) => {
    try {
      const response = await getComponentInstance().generateFormSchemaV2(
        body,
        options
      );
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
  transformToFlow: async (ui_type, config_data, state, asset_config) => {
    try {
      const response = await getComponentInstance().transformToFlow(
        ui_type,
        config_data,
        state,
        asset_config
      );
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
  parseSchemaWithDefaultValue: (schema: unknown, updateKeyByAlias = false) => {
    return getComponentInstance().parseSchemaWithDefaultValue(
      schema,
      updateKeyByAlias
    );
  },
};
