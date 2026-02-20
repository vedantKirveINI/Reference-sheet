/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_TOKEN: string;
  readonly VITE_DEFAULT_SHEET_PARAMS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
