import User from "oute-services-user-sdk";
import { getOuteServerConfig, handleError } from "./base-config";

const getUserInstance = () => new User(getOuteServerConfig());

const userServices = {
  authUserInfo: async () => {
    try {
      const response = await getUserInstance().authUserInfo();
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};
export default userServices;
