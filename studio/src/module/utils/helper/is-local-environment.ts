export const isLocalEnvironment = (): boolean => {
  const environment = process.env.NODE_ENV;

  return environment === "development";
};
