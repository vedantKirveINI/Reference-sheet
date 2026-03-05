import apiService from "./apiService";
const CANVAS_ENDPOINTS = {
  CANVAS_ADD: "/service/v0/canvas/add",
  CANVAS_FIND_ONE: "/service/v0/canvas/find/one",
};
const canvasServices = {
  saveCanvas: async (payload = {}) => {
    const response = await apiService.post(
      CANVAS_ENDPOINTS.CANVAS_ADD,
      payload
    );
    return response;
  },
  findCanvas: async (params = {}) => {
    const response = await apiService.get(CANVAS_ENDPOINTS.CANVAS_FIND_ONE, {
      params,
    });
    return response;
  },
};

export default canvasServices;
