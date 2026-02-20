/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AUTH_TOKEN: string;
  readonly VITE_DEFAULT_SHEET_PARAMS: string;
  readonly REACT_APP_API_BASE_URL?: string;
  readonly REACT_APP_BYPASS_KEYCLOAK_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
