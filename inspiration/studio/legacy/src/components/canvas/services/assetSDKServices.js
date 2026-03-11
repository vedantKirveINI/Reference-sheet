import Asset from "oute-services-asset-sdk";
import { handleError } from "./baseConfig";
// import { serverConfig } from "oute-ds-utils";
import { serverConfig } from "@src/module/ods";

const getAssetInstance = () => {
  return new Asset({
    url: serverConfig.OUTE_SERVER,
    token: window.accessToken,
  });
};

const assetSDKServices = {
  findOne: async (payload) => {
    try {
      const response = await getAssetInstance().findOne(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },

  getSheets: async (payload) => {
    try {
      const response = await getAssetInstance().getSheets(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getEvents: async (payload) => {
    try {
      const response = await getAssetInstance().getEvents(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getLatestCache: async (user_id, workspace_id, checksum) => {
    try {
      const response = await getAssetInstance().getLatestCache(
        user_id,
        workspace_id,
        checksum
      );
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getFlatList: async (payload) => {
    try {
      const response = await getAssetInstance().getFlatList(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};

export default assetSDKServices;
