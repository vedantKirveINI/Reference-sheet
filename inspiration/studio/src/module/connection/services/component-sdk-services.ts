import Component from "oute-services-component-sdk";
import { getCanvasSDKConfig, handleError } from "./base-config";

const getComponentInstance = () => {
  return new Component(getCanvasSDKConfig());
};

export const componentSDKServices = {
  executeTransformedNode: async (body) => {
    try {
      const response = await getComponentInstance().executeTransformedNode(
        body
      );
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
};
