import User from "oute-services-user-sdk";
import { handleError } from "./baseConfig";
// import { serverConfig } from '@src/module/ods';
import { serverConfig } from "@src/module/ods";

const getUserInstance = () => {
  return new User({
    url: serverConfig.OUTE_SERVER,
    token: window.accessToken,
  });
};

const userServices = {
  getUser: async () => {
    try {
      const response = await getUserInstance().loginV1();
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};
export default userServices;
