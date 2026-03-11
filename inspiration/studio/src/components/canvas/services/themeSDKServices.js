import Theme from "oute-services-themes-sdk";
import { handleError } from "./baseConfig";
// import { serverConfig } from '@src/module/ods';
import { serverConfig } from "@src/module/ods";

const getThemeInstance = () => {
  return new Theme({
    url: serverConfig.STUDIO_SERVER,
    token: window.accessToken,
  });
};

const themeSDKServices = {
  save: async (query) => {
    try {
      const response = await getThemeInstance().save(query);
      return response?.result;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
  list: async (query) => {
    try {
      const response = await getThemeInstance().list(query);
      return response?.result;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
  delete: async (query) => {
    try {
      const response = await getThemeInstance().delete(query);
      return response?.result;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
};

export default themeSDKServices;
