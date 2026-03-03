/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AUTH_TOKEN?: string;
  readonly VITE_DEFAULT_SHEET_PARAMS?: string;
  readonly VITE_FILE_UPLOAD_SERVER?: string;
  readonly VITE_OUTE_SERVER?: string;
  readonly REACT_APP_API_BASE_URL?: string;
  readonly REACT_APP_BYPASS_KEYCLOAK_TOKEN?: string;
  readonly REACT_APP_LOGIN_URL?: string;
  readonly REACT_APP_KEYCLOAK_RESOURCE?: string;
  readonly REACT_APP_KEYCLOAK_REALM?: string;
  readonly REACT_APP_KEYCLOAK_AUTH_SERVER_URL?: string;
  readonly REACT_APP_OUTE_SERVER?: string;
  readonly REACT_APP_HUB_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
