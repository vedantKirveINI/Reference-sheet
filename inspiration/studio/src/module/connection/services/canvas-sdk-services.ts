import Canvas from "oute-services-canvas-sdk";
import { handleError, getCanvasSDKConfig } from "./base-config";

const getCanvasInstance = () => {
  const sdkConfig = getCanvasSDKConfig();
  return new Canvas(sdkConfig);
};

const canvasSDKServices = {
  // eslint-disable-next-line consistent-return
  getPublishedByAsset: async (query) => {
    try {
      const response = await getCanvasInstance().getPublishedByAsset(query);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};

export default canvasSDKServices;
