/**
 * Centralized Environment Variable Management
 * 
 * Provides type-safe access to environment variables with:
 * - Development defaults
 * - Production validation
 * - Security checks
 */

const isDevelopment = true || process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get environment variable with optional default value
 * @param {string} key - Environment variable key
 * @param {string|null} defaultValue - Default value (null if not provided)
 * @param {boolean} required - Whether the variable is required in production
 * @returns {string|null} Environment variable value or default
 */
const getEnvVar = (key, defaultValue = null, required = false) => {
  const value = process.env[key] || defaultValue;
  
  if (required && isProduction && !value) {
    console.error(`[ENV] Required environment variable ${key} is missing in production`);
    if (isProduction) {
      throw new Error(`Required environment variable ${key} is missing`);
    }
  }
  
  return value;
};

/**
 * Get boolean environment variable
 * @param {string} key - Environment variable key
 * @param {boolean} defaultValue - Default boolean value
 * @returns {boolean} Parsed boolean value
 */
const getBooleanEnvVar = (key, defaultValue = false) => {
  const value = getEnvVar(key, String(defaultValue));
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

/**
 * Environment configuration object
 */
export const env = {
  // Sentry Configuration
  sentry: {
    dsn: getEnvVar('REACT_APP_SENTRY_DSN', null),
    enabled: getBooleanEnvVar('REACT_APP_ENABLE_SENTRY', false),
  },

  // Authentication Configuration
  auth: {
    bypassKeycloak: getBooleanEnvVar('REACT_APP_BYPASS_KEYCLOAK', isDevelopment ? false : false),
    bypassKeycloakToken: getEnvVar('REACT_APP_BYPASS_KEYCLOAK_TOKEN', null),
    loginUrl: getEnvVar('REACT_APP_LOGIN_URL', null),
    keycloakResource: getEnvVar('REACT_APP_KEYCLOAK_RESOURCE', null),
    keycloakRealm: getEnvVar('REACT_APP_KEYCLOAK_REALM', null),
    keycloakAuthServerUrl: getEnvVar('REACT_APP_KEYCLOAK_AUTH_SERVER_URL', null),
    hubOrigin: getEnvVar('REACT_APP_HUB_ORIGIN', null),
  },

  // Server Configuration
  server: {
    outeServer: getEnvVar('REACT_APP_OUTE_SERVER', null),
    wcLandingUrl: getEnvVar('REACT_APP_WC_LANDING_URL', null),
  },

  // Development-only Configuration
  dev: {
    queryParam: getEnvVar('REACT_APP_DEV_QUERY_PARAM', null),
  },

  // Intercom Configuration
  intercom: {
    appId: getEnvVar('REACT_APP_INTERCOM_ID', null),
  },
};

/**
 * Validate production environment configuration
 */
export const validateProductionConfig = () => {
  if (!isProduction) return;

  const errors = [];

  // Check if bypass is enabled in production (security risk)
  if (env.auth.bypassKeycloak) {
    errors.push('REACT_APP_BYPASS_KEYCLOAK cannot be true in production');
  }

  // Check if bypass token is set in production (security risk)
  if (env.auth.bypassKeycloakToken) {
    errors.push('REACT_APP_BYPASS_KEYCLOAK_TOKEN cannot be set in production');
  }

  if (errors.length > 0) {
    console.error('[ENV] Production configuration errors:', errors);
    throw new Error(`Production configuration errors: ${errors.join(', ')}`);
  }
};

/**
 * Get development fallback values (only in development mode)
 */
export const getDevFallbacks = () => {
  if (!isDevelopment) {
    return {
      bypassKeycloak: false,
      bypassKeycloakToken: null,
      queryParam: null,
    };
  }

  // These are development-only fallbacks - should not be used in production
  return {
    bypassKeycloak: env.auth.bypassKeycloak,
    bypassKeycloakToken: env.auth.bypassKeycloakToken,
    queryParam: env.dev.queryParam,
  };
};

// Validate configuration on module load in production
if (isProduction) {
  validateProductionConfig();
}

export default env;


