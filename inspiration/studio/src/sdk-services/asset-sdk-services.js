import Asset from "oute-services-asset-sdk";
import { handleError } from "./baseConfig";
// import { serverConfig } from '@src/module/ods';
import { serverConfig } from "@src/module/ods";

const getAssetInstance = () => {
  return new Asset({
    url: serverConfig.OUTE_SERVER,
    token: window.accessToken,
  });
};

const assetSDKServices = {
  getMembers: async (asset_id) => {
    try {
      const response = await getAssetInstance().getMembers(asset_id);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getEvents: async (params) => {
    try {
      const response = await getAssetInstance().getEvents(params);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  findOne: async (payload) => {
    try {
      const response = await getAssetInstance().findOne(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  restoreAsset: async (asset_id) => {
    try {
      const response = await getAssetInstance().restore(asset_id);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getAccessInfo: async (asset_id) => {
    try {
      const response = await getAssetInstance().getAccessInfo(asset_id);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};

export default assetSDKServices;
