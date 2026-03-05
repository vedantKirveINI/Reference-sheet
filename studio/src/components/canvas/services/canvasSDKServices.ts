import Canvas from "oute-services-canvas-sdk";
import getSDKConfig, { handleError } from "./baseConfig";

const getCanvasInstance = () => {
  return new Canvas(getSDKConfig());
};

export const canvasSDKServices = {
  getPublishedListByProject: async (params = {}) => {
    try {
      const response =
        await getCanvasInstance().getPublishedListByProject(params);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getBoundsIOOfPublishedCanvas: async (payload = {}) => {
    try {
      const response =
        await getCanvasInstance().getBoundsIOOfPublishedCanvas(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getPublishedByAsset: async (query) => {
    try {
      const response = await getCanvasInstance().getPublishedByAsset(query);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  saveSnapshot: async (payload) => {
    try {
      const response = await getCanvasInstance().saveSnapshot(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};
