import { serverConfig } from "@src/module/ods";

export const getToken = () => {
  return window["accessToken"];
};

export const getOuteServerConfig = () => {
  return { url: serverConfig.OUTE_SERVER, token: getToken() };
};

export const handleError = (error) => {
  return error;
};
