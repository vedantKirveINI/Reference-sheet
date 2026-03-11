import HookNRun from "oute-services-hook-n-run-sdk";
import { getWebhookServerConfig, handleError } from "./baseConfig";

const getInstance = () => {
  return new HookNRun(getWebhookServerConfig());
};

const hookNRunServices = {
  generateWebhookUrl: (body) => {
    return getInstance()
      .generateWebhookUrl(body)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        handleError(error);
      });
  },
  getWebhookList: (query) => {
    return getInstance()
      .getWebhookList(query)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        handleError(error);
      });
  },
  getQueueByStart: (query) => {
    return getInstance()
      .getQueueByStart(query)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        handleError(error);
      });
  },
};
export default hookNRunServices;
