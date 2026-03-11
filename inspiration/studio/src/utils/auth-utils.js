import Utility from "oute-services-utility-sdk";

/**
 * Parse user information from a JWT token
 * @param {string} token - JWT access token
 * @returns {object|null} User object with extracted claims, or null if parsing fails
 */
export function parseUserFromToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[AuthUtils] Invalid JWT token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(Utility.fromBase64(parts[1]));

    // Extract user information from token claims
    return {
      sub: payload.sub || null,
      email: payload.email || null,
      name: payload.name || null,
      given_name: payload.given_name || null,
      family_name: payload.family_name || null,
      preferred_username: payload.preferred_username || null,
      email_verified: payload.email_verified || false,
    };
  } catch (error) {
    console.error('[AuthUtils] Error parsing token:', error);
    return null;
  }
}
