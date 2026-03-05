import Storage from "oute-services-storage-sdk";
import { handleError, getOuteFileUploadServerConfig } from "./baseConfig";

const getStorageInstance = () => {
  return new Storage(getOuteFileUploadServerConfig());
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
};

export default storageSDKServices;
