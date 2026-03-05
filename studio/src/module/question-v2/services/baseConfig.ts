import { serverConfig } from '@src/module/ods';
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
    url: serverConfig.CONTENT_API_SERVER,
    token: getToken(),
  };
};
export const handleError = (error) => {
  if (error.status !== "success") {
    toast.error("Question Error", {
      description: error.result?.message || "An error occurred",
    });
  }
};

export default getSDKConfig;
