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

export async function updateViewSort(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  sort: { sortObjs: Array<{ fieldId: string; order: string; dbFieldName?: string; type?: string }>; manualSort?: boolean };
}) {
  return apiClient.post('/view/update_sort', payload);
}

export async function updateViewFilter(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  filter: any;
}) {
  return apiClient.post('/view/update_filter', payload);
}

export async function updateViewGroupBy(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  groupBy: { groupObjs: Array<{ fieldId: string; order: string; dbFieldName?: string; type?: string }> };
}) {
  return apiClient.post('/view/update_group_by', payload);
}

export async function updateColumnMeta(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  columnMeta: Record<string, any>;
}) {
  return apiClient.post('/view/update_column_meta', payload);
}

export async function updateFieldsStatus(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  fields: Array<{ id: number; status: string }>;
}) {
  return apiClient.post('/field/update_fields_status', payload);
}

export { apiClient, getToken, API_BASE_URL };
