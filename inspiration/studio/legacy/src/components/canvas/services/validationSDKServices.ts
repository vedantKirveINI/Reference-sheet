import Validation from "oute-services-validation-sdk";
import getSDKConfig, { handleError } from "./baseConfig";

const getValidationInstance = () => {
  return new Validation(getSDKConfig());
};

export const validationSDKServices = {
  getValidationList: async (query = {}) => {
    try {
      const response = await getValidationInstance().list(query);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};
