import _ from "lodash";
import { AUTH_TYPES } from "@src/module";
import { serverConfig } from "@src/module/ods";

export function getConfigObjectByKey<T>(configs: T[], key: string): T | null {
  if (_.isEmpty(configs) || _.isEmpty(key)) return null;
  const config: any = configs.find((config: any) => config?.key === key);
  if (config) return config?.value;

  return null;
}

export const getFormID = (question: any): string | null => {
  const authType = question?.authorization_type;
  const configs: any[] = question?.configs;

  if (authType === AUTH_TYPES.APIKEY) return serverConfig.API_KEY_AUTH_FORM_ID;

  if (authType === AUTH_TYPES.CUSTOM)
    return getConfigObjectByKey(configs, "form_id");

  if (authType === AUTH_TYPES.BASIC) return serverConfig.BASIC_AUTH_FORM_ID;

  return null;
};
