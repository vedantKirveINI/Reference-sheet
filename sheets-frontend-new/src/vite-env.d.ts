/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_TOKEN?: string;
  readonly REACT_APP_API_BASE_URL?: string;
  readonly REACT_APP_DEFAULT_SHEET_PARAMS?: string;
  readonly REACT_APP_FILE_UPLOAD_SERVER?: string;
  readonly REACT_APP_SOCKET_URL?: string;
  readonly REACT_APP_WORKFLOW_URL?: string;
  readonly REACT_APP_STUB_MODE?: string;
  readonly REACT_APP_POSTHOG_KEY?: string;
  readonly REACT_APP_POSTHOG_HOST?: string;
  readonly REACT_APP_SENTRY_DSN?: string;
  readonly REACT_APP_ENABLE_SENTRY?: string;
  readonly REACT_APP_AI_SERVICE_URL?: string;
  readonly REACT_APP_ALLOWED_EMBED_ORIGINS?: string;
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
