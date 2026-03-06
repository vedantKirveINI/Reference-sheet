type Config = {
  description: string;
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: string;
  value: string;
};

export const getOAuth2UrlFromConfig = (configs = []) => {
  let oAuthEndPointConfig: Config | undefined;
  let client_id: Config | undefined;
  let redirect_uri: Config | undefined;
  let scope: Config | undefined;
  let response_type: Config | undefined;
  let access_type: Config | undefined;
  let prompt: Config | undefined;

  // eslint-disable-next-line no-restricted-syntax
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
      case "response_type":
        response_type = config;
        break;
      case "access_type":
        access_type = config;
      case "prompt":
        prompt = config;
        break;
      default:
        break;
    }
  }

  if (!oAuthEndPointConfig || !client_id || !redirect_uri || !response_type) {
    return "";
  }

  return `${oAuthEndPointConfig.value}?client_id=${
    client_id.value
  }&redirect_uri=${redirect_uri.value}&response_type=${
    response_type.value
  }${scope?.value ? "&scope=" + scope.value : ""}${
    access_type?.value ? "&access_type=" + access_type.value : ""
  }&include_granted_scopes=true&disallow_webview=false${
    prompt?.value ? "&prompt=" + prompt.value : ""
  }`;
};
