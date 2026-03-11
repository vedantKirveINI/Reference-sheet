import User from "oute-services-user-sdk";
import { getOuteServerConfig, handleError } from "./baseConfig";

const getUserInstance = () => new User(getOuteServerConfig());

const userServices = {
  getUser: async () => {
    try {
      const response = await getUserInstance().loginV1();
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  //   updateUser: async (userData) => {
  //     try {
  //       const response = await getUserInstance().save(userData);
  //       return response;
  //     } catch (error) {
  //       handleError(error);
  //     }
  //   },
};
export default userServices;
