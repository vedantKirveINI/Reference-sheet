import Component from "oute-services-component-sdk";
import getSDKConfig, { handleError } from "./baseConfig";

const getComponentInstance = () => {
  return new Component(getSDKConfig());
};
const componentSDKServices = {
  /**
   *
   * @param {object} canvas_data The current GOJS model
   * @param {string} from_id The from node's key
   * @param {string} to_id The to node's key
   * @returns
   */
  canConnect: async (canvas_data, from_id, to_id) => {
    try {
      const response = await getComponentInstance().canConnect(
        canvas_data,
        from_id,
        to_id,
      );
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getConnectList: async (canvas_data, node_id) => {
    try {
      const response = await getComponentInstance().getConnectList(
        canvas_data,
        node_id,
      );
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  transformNode: async (canvas_data, node_id, payload) => {
    try {
      const response = await getComponentInstance().transformNode(
        canvas_data,
        node_id,
        payload,
      );
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getVariableList: async (
    canvas_data,
    node_id,
    project_id,
    asset_id,
    options = {},
  ) => {
    try {
      const response = await getComponentInstance().getVariableList(
        canvas_data,
        node_id,
        project_id,
        asset_id,
        options,
      );
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
  validateNodeRefs: async (canvas_data, node_id, variables) => {
    try {
      const response = await getComponentInstance().validateNodeRefs(
        canvas_data,
        node_id,
        variables,
      );
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  conditionsToString: (conditions, ref_map) => {
    try {
      const response = getComponentInstance().conditionsToString(
        conditions,
        ref_map,
      );
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};
export default componentSDKServices;
