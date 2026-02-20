import axios from 'axios';

const API_BASE_URL = '/api';

if (import.meta.env.VITE_AUTH_TOKEN && !(window as any).accessToken) {
  (window as any).accessToken = import.meta.env.VITE_AUTH_TOKEN;
}

const getToken = (): string => {
  return (window as any).accessToken || '';
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
