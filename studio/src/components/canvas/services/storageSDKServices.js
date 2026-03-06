import Storage from "oute-services-storage-sdk";
import { getStorageConfig, handleError } from "./baseConfig";

const getStorageInstance = () => {
  return new Storage(getStorageConfig());
};

const storageSDKServices = {
  uploadFile: async (payload) => {
    try {
      const response = await getStorageInstance().uploadFile(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getUploadSignedUrl: async (payload) => {
    try {
      const response = await getStorageInstance().getUploadSignedUrl(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};

export default storageSDKServices;
