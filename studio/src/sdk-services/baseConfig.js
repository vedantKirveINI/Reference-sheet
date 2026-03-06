import { serverConfig } from "@src/module/ods";
import { toast } from "sonner";
import { SUCCESS } from "../constants/keys";

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
  return {
    url: serverConfig.OUTE_SERVER,
    token: getToken(),
  };
};

export const getOuteFileUploadServerConfig = () => {
  return {
    url: serverConfig.FILE_UPLOAD_SERVER,
    token: getToken(),
  };
};

export const getUATUServerConfig = () => {
  return {
    url: serverConfig.UATU_SERVER,
    token: getToken(),
    useWebSocket: false,
    debug: false,
  };
};

const getContextualErrorMessage = (error) => {
  if (error?.result?.message) {
    return error.result.message;
  }
  
  const statusCode = error?.result?.statusCode || error?.statusCode;
  
  if (statusCode === 400) {
    return "Invalid request. Please check your input and try again.";
  } else if (statusCode === 401) {
    return "Your session has expired. Please log in again.";
  } else if (statusCode === 403) {
    return "You don't have permission to perform this action.";
  } else if (statusCode === 404) {
    return "The requested resource was not found.";
  } else if (statusCode === 429) {
    return "Too many requests. Please wait a moment and try again.";
  } else if (statusCode >= 500) {
    return "Our servers are temporarily unavailable. Please try again later.";
  }
  
  return "An unexpected error occurred. Please try again.";
};

export const handleError = (error, context = "") => {
  if (error.status !== SUCCESS) {
    const message = getContextualErrorMessage(error);
    toast.error(context ? `${context}: ${message}` : message);
  }
  return;
};

export const getStudioServerConfig = () => {
  return {
    url: serverConfig.STUDIO_SERVER,
    token: getToken(),
  };
};

export default getSDKConfig;
