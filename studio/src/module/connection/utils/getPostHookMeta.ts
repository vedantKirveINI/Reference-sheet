import { AUTH_TYPES } from "@src/module";
import { getConfigObjectByKey } from "./getFormID";

const postHookFetch = async (url: string, body: any): Promise<any> => {
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to post hook: ${res?.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(`Error in post hook: ${error?.message}`);
  }
};

export const getPostHookMeta = async (
  question: any,
  body?: any
): Promise<any> => {
  const authType = question?.authorization_type;
  const configs: any[] = question?.configs;

  if (!authType || !configs) return Promise.resolve(null);

  const postHookUrl = getConfigObjectByKey(configs, "post_auth_url");
  if (!postHookUrl) return Promise.resolve(null);

  if (authType === AUTH_TYPES.CUSTOM) {
    return await postHookFetch(postHookUrl, body);
  }

  if (authType === AUTH_TYPES.APIKEY) {
    return await postHookFetch(postHookUrl, body);
  }

  if (authType === AUTH_TYPES.BASIC) {
    return await postHookFetch(postHookUrl, body);
  }

  return null;
};
