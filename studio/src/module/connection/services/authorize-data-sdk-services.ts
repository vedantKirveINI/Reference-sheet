import AuthorizeData from "oute-services-authorized-data-sdk";
import { handleError, getSDKConfig } from "./base-config";

const getAuthorizeDataInstance = () => {
  const sdkConfig = getSDKConfig();
  return new AuthorizeData(sdkConfig);
};

const authorizeDataSDKServices = {
  getByParent: async (query) => {
    try {
      const response = await getAuthorizeDataInstance().getByParent(query);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};

export default authorizeDataSDKServices;
