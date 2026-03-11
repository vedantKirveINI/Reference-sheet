import Sheet from "oute-services-sheet-sdk";
import { handleError } from "./baseConfig";
// import { serverConfig } from '@src/module/ods';
import { serverConfig } from "@src/module/ods";

const getSheetInstance = () => {
  return new Sheet({
    url: serverConfig.SHEET_SERVER,
    token: window.accessToken,
  });
};

const sheetSDKServices = {
  getSubSheetsByAssetId: async (asset_id) => {
    try {
      const response = await getSheetInstance().getSubSheetsByAssetId(asset_id);
      return response;
    } catch (error) {
      handleError(error);
    }
  },

  getSubSheetById: async (query) => {
    try {
      const response = await getSheetInstance().getSubSheetById(query);
      return response;
    } catch (error) {
      handleError(error);
    }
  },

  createStream: async (payload) => {
    try {
      const response = await getSheetInstance().createStream(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  updateStream: async (payload) => {
    try {
      const response = await getSheetInstance().updateStream(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  upsertStream: async (payload) => {
    try {
      const response = await getSheetInstance().upsertStream(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};

export default sheetSDKServices;
