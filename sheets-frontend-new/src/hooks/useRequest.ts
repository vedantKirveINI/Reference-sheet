import axios from 'axios';
import { makeUseAxios } from 'axios-hooks';
import { API_BASE_URL, getToken } from '../services/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    if (!config.headers) {
      config.headers = {} as any;
    }
    const headers = config.headers as any;
    headers.token = headers.token || token;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject({ isCancel: true });
    }
    return Promise.reject(error);
  }
);

const useRequest = makeUseAxios({
  axios: instance,
});

export default useRequest;

