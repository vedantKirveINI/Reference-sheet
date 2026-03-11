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
    url: serverConfig.STUDIO_SERVER,
    token: getToken(),
  };
};
export const handleError = (error) => {
  if (error.status !== "success") {
    const errorMessage = error.result?.message || "An error occurred";
    toast.error("Integration Error", {
      description: errorMessage,
    });
  }
};

export default getSDKConfig;
