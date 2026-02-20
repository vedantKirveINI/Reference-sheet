import axios from 'axios';

const API_BASE_URL =
  import.meta.env.REACT_APP_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '/api';

const bypassToken =
  import.meta.env.VITE_AUTH_TOKEN || import.meta.env.REACT_APP_BYPASS_KEYCLOAK_TOKEN;
if (bypassToken && !(window as any).accessToken) {
  (window as any).accessToken = bypassToken;
}

const getToken = (): string => {
  return (
    (window as any).accessToken ||
    import.meta.env.VITE_AUTH_TOKEN ||
    import.meta.env.REACT_APP_BYPASS_KEYCLOAK_TOKEN ||
    ''
  );
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.token = token;
  }
  return config;
});

export { apiClient, getToken, API_BASE_URL };
