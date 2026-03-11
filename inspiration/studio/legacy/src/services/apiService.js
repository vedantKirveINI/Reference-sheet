import axios from "axios";
import { serverConfig } from "@src/module/ods";

const api = axios.create({
  baseURL: serverConfig.STUDIO_SERVER,
});

api.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = `application/json`;
    config.headers["token"] = window.accessToken;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const apiService = {
  get: async (url, config) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (e) {
      throw e;
    }
  },
  post: async (url, data, config) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (e) {
      throw e;
    }
  },
  delete: async (url, config) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (e) {
      throw e;
    }
  },
};

export default apiService;
