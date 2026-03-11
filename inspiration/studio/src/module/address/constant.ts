export const ENV = {
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
} as const;

export type ENV = (typeof ENV)[keyof typeof ENV];
