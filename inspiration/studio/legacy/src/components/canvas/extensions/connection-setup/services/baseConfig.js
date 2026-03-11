// import { showAlert } from "oute-ds-alert";
// import { serverConfig } from "oute-ds-utils";
import { showAlert, serverConfig } from "@src/module/ods";

const getToken = () => {
  return window.accessToken;
};

const getSDKConfig = () => {
  return {
    url: serverConfig.OUTE_SERVER,
    token: getToken(),
  };
};

const handleError = (error) => {
  if (error.status !== "success") {
    showAlert({
      type: "error",
      message: error.result.message,
    });
  }
};

export { getSDKConfig, handleError };
