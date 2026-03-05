// Theme SDK Services
// Provides CRUD operations for user themes via oute-services-themes-sdk

import Theme from "oute-services-themes-sdk";
import { serverConfig } from "@src/module/ods";

/**
 * Get a configured Theme SDK instance
 * @returns {Theme} Theme SDK instance
 */
const getThemeInstance = () => {
  return new Theme({
    url: serverConfig.STUDIO_SERVER,
    token: window.accessToken,
  });
};

export const themeSDKServices = {
  /**
   * List all themes for a workspace
   * @param {Object} params - { workspace_id }
   * @returns {Promise<Array>} List of themes
   */
  async list(query = {}) {
    try {
      const response = await getThemeInstance().list(query);
      return response?.result || [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Save (create or update) a theme
   * @param {Object} themeData
   * @returns {Promise<Object|null>}
   */
  async save(themeData) {
    try {
      const response = await getThemeInstance().save(themeData);
      return response?.result || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Delete a theme by ID
   * @param {string|Object} themeIdOrQuery - theme ID string or query object
   * @returns {Promise<boolean>}
   */
  async delete(themeIdOrQuery) {
    try {
      const query = typeof themeIdOrQuery === 'string' 
        ? { _id: themeIdOrQuery } 
        : themeIdOrQuery;
      await getThemeInstance().delete(query);
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default themeSDKServices;
