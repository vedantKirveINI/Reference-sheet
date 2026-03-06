export const AUTH_TYPES = {
  OAUTH2_AUTHORIZATION_CODE: "OAUTH2_AUTHORIZATION_CODE",
  BASIC: "BASIC",
  APIKEY: "APIKEY",
  CUSTOM: "CUSTOM",
} as const;

export type AuthType = (typeof AUTH_TYPES)[keyof typeof AUTH_TYPES];

export { CreateEventConnection, default } from "./CreateEventConnection";
