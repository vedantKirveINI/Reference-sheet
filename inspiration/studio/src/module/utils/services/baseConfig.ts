import { serverConfig } from "@src/module/ods";
import { toast } from "sonner";

declare global {
  interface Window {
    accessToken?: string;
  }
}
const getToken = () => {
  return window.accessToken;
};
const getSDKConfig = () => {
  return {
    url: serverConfig.STUDIO_SERVER,
    token: getToken(),
  };
};

export const getOuteServerConfig = () => {
  return { url: serverConfig.OUTE_SERVER, token: getToken() };
};

export const handleError = (error) => {
  if (error.status !== "success") {
    toast.error("Service Error", {
      description: error.result?.message || "An error occurred",
    });
  }
};

export default getSDKConfig;
