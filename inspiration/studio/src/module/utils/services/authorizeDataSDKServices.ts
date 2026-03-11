import AuthorizeData from "oute-services-authorized-data-sdk";
import { handleError, getOuteServerConfig } from "./baseConfig";

const getAuthorizeDataInstance = () => {
  const sdkConfig = getOuteServerConfig();
  return new AuthorizeData(sdkConfig);
};

export const authorizeDataSDKServices = {
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
