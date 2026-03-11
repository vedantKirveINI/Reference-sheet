import Domain from "oute-services-domain-sdk";
import { getOuteServerConfig, handleError } from "./baseConfig";

const getDomainInstance = () => new Domain(getOuteServerConfig());

const domainSDKServices = {
  checkAvailability: async (payload = {}) => {
    try {
      const response = await getDomainInstance().check(payload);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  setDomain: async (payload = {}) => {
    try {
      const response = await getDomainInstance().set(payload);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getByDomain: async (payload = {}) => {
    try {
      const response = await getDomainInstance().getByName(payload);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  findByWorkspace: async (payload = {}) => {
    try {
      const response = await getDomainInstance().findByWorkspace(payload);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getDnsRecords: async (payload = {}) => {
    try {
      const response = await getDomainInstance().getDnsRecords(payload);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  checkVerificationStatus: async (payload = {}) => {
    try {
      const response =
        await getDomainInstance().checkVerificationStatus(payload);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  verifyDomainManually: async (payload = {}) => {
    try {
      const response = await getDomainInstance().verifyDomainManually(payload);

      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  deleteDomain: async (payload = {}) => {
    try {
      const { domain_id } = payload;
      const response = await getDomainInstance().deleteDomain(domain_id);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

export default domainSDKServices;
