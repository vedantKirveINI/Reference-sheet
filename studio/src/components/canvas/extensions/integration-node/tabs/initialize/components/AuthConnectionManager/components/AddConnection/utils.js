// import { serverConfig } from '@src/module/ods';
import { serverConfig } from "@src/module/ods";
import { AUTH_TYPES } from "../../../../../../../../utils/constants";
import { isEmpty } from "lodash";

export function shouldRenderDialog(auth_type) {
  if (
    auth_type === "api-key" ||
    auth_type === "basic" ||
    auth_type === "custom"
  ) {
    return true;
  }

  return false;
}
function getConfigObjectByKey(configs, key) {
  if (isEmpty(configs) || isEmpty(key)) return null;
  const config = configs.find((config) => config?.key === key);
  if (config) return config?.value;

  return null;
}

export const getFormID = (question) => {
  const authType = question?.authorization_type;
  const configs = question?.configs;

  if (authType === AUTH_TYPES.APIKEY) return serverConfig.API_KEY_AUTH_FORM_ID;

  if (authType === AUTH_TYPES.CUSTOM)
    return getConfigObjectByKey(configs, "form_id");

  if (authType === AUTH_TYPES.BASIC) return serverConfig.BASIC_AUTH_FORM_ID;

  return null;
};

export const getStateId = async (authorizationState) => {
  const response = await fetch(
    `${serverConfig.OUTE_SERVER}/service/v0/temp/storage/save`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: window.accessToken,
      },
      body: JSON.stringify({
        meta: authorizationState,
      }),
    }
  );

  const responseData = await response.json();

  if (responseData.status !== "success") {
    throw new Error(
      responseData?.result?.message || "Failed to save authorization state"
    );
  }

  return responseData?.result?._id;
};

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode.apply(null, buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);

  return base64UrlEncode(array);
}

export async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  const digest = await crypto.subtle.digest("SHA-256", data);

  const hashArray = new Uint8Array(digest);

  return base64UrlEncode(hashArray);
}

const getIncludeGrantedScopesValue = (include_granted_scopes_value) => {
  if (include_granted_scopes_value === "Yes") {
    return "true";
  } else if (include_granted_scopes_value === "No") {
    return "false";
  } else if (include_granted_scopes_value === "None") {
    return "";
  } else {
    return "true";
  }
};

const getDisallowWebViewValue = (disallow_webview_value) => {
  if (disallow_webview_value === "Yes") {
    return "true";
  } else if (disallow_webview_value === "No") {
    return "false";
  } else if (disallow_webview_value === "None") {
    return "";
  } else {
    return "false";
  }
};

export const getOAuth2UrlFromConfig = async (configs = []) => {
  let oAuthEndPointConfig;
  let client_id;
  let redirect_uri;
  let scope;
  let user_scope;
  let response_type;
  let access_type;
  let prompt;
  let allow_pkce;
  let duration;
  let permissions;
  let owner;
  let include_granted_scopes;
  let disallow_webview;

  for (const config of configs) {
    switch (config.key) {
      case "authorization_uri":
        oAuthEndPointConfig = config;
        break;
      case "client_id":
        client_id = config;
        break;
      case "redirect_uri":
        redirect_uri = config;
        break;
      case "scope":
        scope = config;
        break;
      case "user_scope":
        user_scope = config;
        break;
      case "response_type":
        response_type = config;
        break;
      case "access_type":
        access_type = config;
        break;
      case "prompt":
        prompt = config;
        break;
      case "allow_pkce":
        allow_pkce = config;
        break;
      case "duration":
        duration = config;
        break;
      case "owner":
        owner = config;
        break;
      case "permissions":
        permissions = config;
        break;
      case "include_granted_scopes":
        include_granted_scopes = config;
        break;
      case "disallow_webview":
        disallow_webview = config;
        break;
      default:
        break;
    }
  }

  if (
    !oAuthEndPointConfig ||
    !client_id ||
    !redirect_uri ||
    !scope ||
    !response_type
  ) {
    return {
      URL: "",
      code_verifier: "",
    };
  }

  const isAllowPkce = allow_pkce?.value === "Yes";
  let code_verifier = isAllowPkce ? generateCodeVerifier() : "";
  let code_challenge = isAllowPkce
    ? await generateCodeChallenge(code_verifier)
    : "";
  let include_granted_scopes_value = getIncludeGrantedScopesValue(
    include_granted_scopes?.value
  );
  let disallow_webview_value = getDisallowWebViewValue(disallow_webview?.value);

  const authUrl = `${oAuthEndPointConfig.value}?client_id=${
    client_id.value
  }&redirect_uri=${redirect_uri.value}&response_type=${
    response_type.value
  }${scope?.value ? "&scope=" + scope.value : ""}${user_scope?.value ? "&user_scope=" + user_scope.value : ""}${
    access_type?.value ? "&access_type=" + access_type.value : ""
  }${
    include_granted_scopes_value
      ? "&include_granted_scopes=" + include_granted_scopes_value
      : ""
  }${
    disallow_webview_value ? "&disallow_webview=" + disallow_webview_value : ""
  }${
    prompt?.value ? "&prompt=" + prompt.value : ""
  }${code_verifier ? "&code_challenge=" + code_challenge + "&code_challenge_method=S256" : ""}${
    duration?.value ? "&duration=" + duration.value : ""
  }${owner?.value ? "&owner=" + owner.value : ""}${permissions?.value ? "&permissions=" + permissions.value : ""}`;

  return {
    authUrl,
    code_verifier,
  };
};

/**
 * Extract scopes from authorization configs
 * @param {Object} authorization - Authorization object with configs
 * @returns {Array<string>} Array of unique scope URLs
 */
export const extractScopes = (authorization) => {
  const configs = authorization?.configs || [];
  const scopeConfig = configs.find((c) => c.key === "scope");
  const userScopeConfig = configs.find((c) => c.key === "user_scope");

  const scopes = [];

  const splitScopes = (value) => {
    if (!value) return [];
    // Split by both space and comma, then filter out empty strings
    return value
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  if (scopeConfig?.value) {
    scopes.push(...splitScopes(scopeConfig.value));
  }
  if (userScopeConfig?.value) {
    scopes.push(...splitScopes(userScopeConfig.value));
  }
  return [...new Set(scopes)]; // Remove duplicates
};

/**
 * Format scope URL to readable permission name
 * @param {string} scopeUrl - OAuth scope URL
 * @returns {string} Original scope URL (no transformation)
 */
export const formatScope = (scopeUrl) => {
  if (!scopeUrl) return "";
  return scopeUrl;
};
