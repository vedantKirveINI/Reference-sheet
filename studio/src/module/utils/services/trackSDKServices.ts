import Track from "oute-services-track-sdk";
import { getOuteServerConfig, handleError } from "./baseConfig";

const getTrackInstance = () => new Track(getOuteServerConfig());

export const trackSDKServices = {
  getCustomerByExternalId: async (workspaceId) => {
    try {
      const response =
        await getTrackInstance().getCustomerByExternalId(workspaceId);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  getSubscriptionsByCustomer: async (payload = {}) => {
    try {
      const response =
        await getTrackInstance().getSubscriptionsByCustomer(payload);
      return response;
    } catch (error) {
      handleError(error);
    }
  },
  checkIfPremiumUser: async (workspaceId) => {
    try {
      const customer =
        await trackSDKServices.getCustomerByExternalId(workspaceId);

      if (!customer?.result?.data?._id) {
        return false;
      }

      const subscriptionPlan =
        await trackSDKServices.getSubscriptionsByCustomer({
          customerId: customer.result.data._id,
        });

      return (
        subscriptionPlan?.result?.data?.planId?.planType?.toLowerCase() !==
        "free"
      );
    } catch (error) {
      handleError(error);
      return false;
    }
  },
};
