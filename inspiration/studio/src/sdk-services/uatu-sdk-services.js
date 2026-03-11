import UATU from "oute-services-uatu-sdk";
import { getUATUServerConfig, handleError } from "./baseConfig";

let uatu_instance = null;

const getUATUInstance = () => {
  if (!uatu_instance) {
    uatu_instance = new UATU(getUATUServerConfig());
  }
  return uatu_instance;
};

const uatuSDKServices = {
  init: async () => {
    try {
      if (process.env.REACT_APP_ENABLE_UATU === "true") {
        const response = await getUATUInstance().init();
        return response;
      }
    } catch (error) {
      handleError(error);
    }
  },
  emit: async (predicate, object) => {
    try {
      if (process.env.REACT_APP_ENABLE_UATU === "true") {
        const response = await getUATUInstance().emit(predicate, object);
        return response;
      }
    } catch (error) {
      handleError(error);
    }
  },
};

export default uatuSDKServices;
