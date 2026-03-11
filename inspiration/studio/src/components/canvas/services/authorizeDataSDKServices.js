import AuthorizeData from "oute-services-authorized-data-sdk";
import { handleError, getOuteServerSdkConfig } from "./baseConfig";

const getAuthorizeDataInstance = () => {
  const sdkConfig = getOuteServerSdkConfig();
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
  save: async (body) => {
    try {
      const response = await getAuthorizeDataInstance().save(body);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  deleteById: async (authorized_data_id) => {
    try {
      const response =
        await getAuthorizeDataInstance().deleteById(authorized_data_id);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};

export default authorizeDataSDKServices;
