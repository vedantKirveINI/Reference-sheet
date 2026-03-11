import Authorization from "oute-services-authorization-sdk";
import { handleError, getSDKConfig } from "./baseConfig";

const getAuthorizationInstance = () => {
  const sdkConfig = getSDKConfig();
  return new Authorization(sdkConfig);
};

const authorizationSDKServices = {
  getByParent: async (query) => {
    try {
      const response = await getAuthorizationInstance().getByParent(query);
      return response;
    } catch (error) {
      handleError(error);
      return error;
    }
  },
};

export default authorizationSDKServices;
