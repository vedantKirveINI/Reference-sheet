import { serverConfig } from "@src/module/ods";
import { toast } from "sonner";

declare global {
  interface Window {
    accessToken?: string;
  }
}
export const getToken = () => {
  return window?.accessToken;
};

const getSDKConfig = () => {
  return {
    url: serverConfig.OUTE_SERVER,
    token: getToken(),
  };
};

const getCanvasSDKConfig = () => {
  return {
    url: serverConfig.STUDIO_SERVER,
  };
};

const handleError = (error) => {
  if (error.status !== "success") {
    toast.error("Connection Error", {
      description: error.result?.message || "An error occurred",
    });
  }
};

export { getSDKConfig, handleError, getCanvasSDKConfig };
