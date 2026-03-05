import { AuthType } from "../types";

export const LEGACY_AUTH_TYPES = {
  OAUTH2_AUTHORIZATION_CODE: "oauth2-authorization-code",
  BASIC: "basic",
  APIKEY: "api-key",
  CUSTOM: "custom",
} as const;

export type LegacyAuthType = typeof LEGACY_AUTH_TYPES[keyof typeof LEGACY_AUTH_TYPES];

const legacyToNewAuthTypeMap: Record<string, AuthType> = {
  "oauth2-authorization-code": "oauth2",
  "oauth2": "oauth2",
  "oauth": "oauth2",
  "oauth2_authorization_code": "oauth2",
  "basic": "basic",
  "api-key": "api-key",
  "apikey": "api-key",
  "api_key": "api-key",
  "custom": "custom",
};

const newToLegacyAuthTypeMap: Record<AuthType, string> = {
  "oauth2": "oauth2-authorization-code",
  "basic": "basic",
  "api-key": "api-key",
  "custom": "custom",
  "database": "custom",
};

export function mapLegacyAuthType(legacyType: string | undefined): AuthType {
  if (!legacyType) return "custom";
  const normalizedType = legacyType.toLowerCase().trim();
  return legacyToNewAuthTypeMap[normalizedType] || "custom";
}

export function mapNewToLegacyAuthType(newType: AuthType): string {
  return newToLegacyAuthTypeMap[newType] || "custom";
}

export function isOAuthType(authType: string | undefined): boolean {
  if (!authType) return false;
  const normalized = authType.toLowerCase().trim();
  return normalized === "oauth2-authorization-code" || 
         normalized === "oauth2" || 
         normalized === "oauth" ||
         normalized === "oauth2_authorization_code";
}

export function isFormBasedType(authType: string | undefined): boolean {
  return (
    authType === "basic" ||
    authType === "api-key" ||
    authType === "custom" ||
    authType === LEGACY_AUTH_TYPES.BASIC ||
    authType === LEGACY_AUTH_TYPES.APIKEY ||
    authType === LEGACY_AUTH_TYPES.CUSTOM
  );
}
