import UserPhotos from "oute-services-user-photos-sdk";
import { getSDKConfig, handleError } from "./base-config";

const getImageInstance = () => {
  const sdkConfig = getSDKConfig();
  return new UserPhotos(sdkConfig);
};

const imageSDKServices = {
  save: async (payload) => {
    try {
      const response = await getImageInstance().save(payload);
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
  list: async (payload) => {
    try {
      const response = await getImageInstance().getList(payload);
      return response?.result;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
  delete: async (payload) => {
    try {
      const response = await getImageInstance().deleteByIds(payload);
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
};

export default imageSDKServices;
