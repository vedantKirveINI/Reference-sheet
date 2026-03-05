import Canvas from "oute-services-canvas-sdk";
import getSDKConfig, { handleError } from "./baseConfig";

const getCanvasInstance = () => {
  return new Canvas(getSDKConfig());
};

const canvasSDKServices = {
  findOne: async (query) => {
    try {
      const response = await getCanvasInstance().findOne(query);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  saveCanvas: async (body) => {
    try {
      const response = await getCanvasInstance().saveCanvas(body);
      return response;
    } catch (error) {
      console.error("[canvasSDKServices.saveCanvas] Error caught:", {
        status: error?.status,
        message: error?.message || error?.result?.message,
        result: error?.result,
        error,
      });
      handleError(error);
      return { status: "failed", message: error?.message || error?.result?.message || "Save failed" };
    }
  },
  publishCanvas: async (payload) => {
    try {
      console.log("payload", payload);
      const response = await getCanvasInstance().publishCanvas(payload);

      return response;
    } catch (error) {
      console.error("[canvasSDKServices.publishCanvas] Error caught:", {
        status: error?.status,
        message: error?.message || error?.result?.message,
        result: error?.result,
        error,
      });
      handleError(error);
      return { status: "failed", message: error?.message || error?.result?.message || "Publish failed" };
    }
  },
  canvasToPublished: async (payload) => {
    try {
      const response = await getCanvasInstance().canvasToPublished(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getPublishedByAsset: async (params) => {
    try {
      const response = await getCanvasInstance().getPublishedByAsset(params);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  executeCanvas: async (canvas_data, state, should_return_state) => {
    try {
      const response = await getCanvasInstance().executeCanvas(
        canvas_data,
        state,
        should_return_state,
      );
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  predictStartNode: async (canvas_data) => {
    try {
      const response = await getCanvasInstance().predictStartNode(canvas_data);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getStartNodeAndSchema: async (canvas_data) => {
    try {
      const response =
        await getCanvasInstance().getStartNodeAndSchema(canvas_data);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  transformCanvas: async (canvas_data) => {
    try {
      const response = await getCanvasInstance().transformCanvas(canvas_data);
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

export default canvasSDKServices;
