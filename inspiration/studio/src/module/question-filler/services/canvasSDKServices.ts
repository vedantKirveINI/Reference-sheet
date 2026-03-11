import Canvas from "oute-services-canvas-sdk";
import getSDKConfig, { handleError } from "./baseConfig";

const getCanvasInstance = () => {
  return new Canvas(getSDKConfig());
};

export const canvasSDKServices = {
  getStartNodeOfPublishedCanvas: (payload = {}) => {
    try {
      const response =
        getCanvasInstance().getStartNodeOfPublishedCanvas(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};
