// import { showAlert } from "oute-ds-alert";
// import { serverConfig } from "oute-ds-utils";
import { showAlert, serverConfig } from "@src/module/ods";

export const getToken = () => {
  return window["accessToken"];
};
const getSDKConfig = () => {
  return {
    url: serverConfig.STUDIO_SERVER,
    token: getToken(),
  };
};
export const getStorageConfig = () => {
  return {
    url: serverConfig.FILE_UPLOAD_SERVER,
    token: getToken(),
  };
};

export const getOuteServerSdkConfig = () => {
  return {
    token: getToken(),
    url: serverConfig.OUTE_SERVER,
  };
};

export const getWebhookServerConfig = () => {
  return {
    token: getToken(),
    url: serverConfig.WEBHOOK_SERVER,
  };
};

export const handleError = (error) => {
  if (error.status !== "success") {
    showAlert({
      type: "error",
      message:
        error.result?.error === "invalid_grant"
          ? "Connection expired"
          : error.result?.message || "An error occurred",
    });
  }
  return;
};

export default getSDKConfig;
