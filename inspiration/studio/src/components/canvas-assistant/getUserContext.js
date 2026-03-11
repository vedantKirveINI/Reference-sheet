import { parseUserFromToken } from "@/utils/auth-utils";

/**
 * getUserContext - Helper function to get user context for Canvas Assistant
 * 
 * Returns user context including userId, accessToken, and workspaceId
 * This function can be passed to useCanvasAssistantChat hook
 */

/**
 * Parse cookies to get a specific cookie value
 */
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
    const [cookieName, ...rest] = cookie.split("=");
    acc[cookieName] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
  return cookies[name] || null;
}

/**
 * Get user context from available sources
 * @param {string} workspaceId - Optional workspace ID to include
 * @returns {object} User context with userId, accessToken, workspaceId
 */
export function getUserContext(workspaceId = null) {
  try {
    // Get access token from cookies
    const accessToken = getCookie('access_token') || null;
    
    // Try to get user ID from token
    let userId = null;
    if (accessToken) {
      const userInfo = parseUserFromToken(accessToken);
      if (userInfo) {
        userId = userInfo.sub || userInfo.preferred_username || null;
      }
    }

    return {
      userId,
      accessToken,
      workspaceId: workspaceId || null,
    };
  } catch (error) {
    console.warn('[getUserContext] Error getting user context:', error);
    return {
      userId: null,
      accessToken: null,
      workspaceId: null,
    };
  }
}

/**
 * Create a getUserContext function that includes workspaceId
 * @param {string} workspaceId - Workspace ID to include
 * @returns {Function} getUserContext function
 */
export function createGetUserContext(workspaceId) {
  return () => getUserContext(workspaceId);
}
