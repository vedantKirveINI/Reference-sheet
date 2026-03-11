// import { serverConfig } from '@src/module/ods';
import { serverConfig } from "@src/module/ods";
import { toast } from "sonner";

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
    console.log("error", error);
    toast.error(
      error.result?.error === "invalid_grant"
        ? "Connection expired"
        : error.result?.message || "An error occurred"
    );
  }
  return;
};

export default getSDKConfig;
