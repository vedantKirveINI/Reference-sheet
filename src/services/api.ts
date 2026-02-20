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

export async function createView(payload: {
  baseId: string;
  tableId: string;
  name: string;
  type: string;
  version?: number;
  columnMeta?: string;
  order?: number;
  options?: Record<string, any>;
}) {
  return apiClient.post('/view/create', payload);
}

export async function renameView(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  name: string;
}) {
  return apiClient.put('/view/rename', payload);
}

export async function deleteView(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
}) {
  return apiClient.delete('/view/delete', { data: payload });
}

export async function fetchViews(payload: {
  baseId: string;
  tableId: string;
}) {
  return apiClient.post('/view/list', payload);
}

export async function createTable(payload: {
  baseId: string;
  name: string;
}) {
  return apiClient.post('/table/create', payload);
}

export async function renameTable(payload: {
  baseId: string;
  tableId: string;
  name: string;
}) {
  return apiClient.put('/table/rename', payload);
}

export async function deleteTable(payload: {
  baseId: string;
  tableId: string;
}) {
  return apiClient.delete('/table/delete', { data: payload });
}

export async function getFileUploadUrl(payload: {
  baseId: string;
  tableId: string;
  fieldId: string;
  recordId: string;
  fileName: string;
  mimeType: string;
}) {
  return apiClient.post('/file/get-upload-url', payload);
}

export async function uploadFileToPresignedUrl(url: string, file: File) {
  return axios.put(url, file, {
    headers: { 'Content-Type': file.type },
  });
}

export async function confirmFileUpload(payload: {
  baseId: string;
  tableId: string;
  fieldId: string;
  recordId: string;
  files: Array<{ url: string; size: number; mimeType: string; name: string }>;
}) {
  return apiClient.post('/file/confirm-upload', payload);
}

export async function updateSheetName(payload: {
  baseId: string;
  name: string;
}) {
  return apiClient.put('/asset/rename', payload);
}

export async function getShareMembers(payload: { baseId: string }) {
  return apiClient.post('/share/members', payload);
}

export async function inviteShareMember(payload: {
  baseId: string;
  email: string;
  role: string;
}) {
  return apiClient.post('/share/invite', payload);
}

export async function updateShareMemberRole(payload: {
  baseId: string;
  userId: string;
  role: string;
}) {
  return apiClient.put('/share/update-role', payload);
}

export async function removeShareMember(payload: {
  baseId: string;
  userId: string;
}) {
  return apiClient.delete('/share/remove-member', { data: payload });
}

export async function updateGeneralAccess(payload: {
  baseId: string;
  access: string;
}) {
  return apiClient.put('/share/general-access', payload);
}

export async function importCSV(payload: {
  baseId: string;
  tableId: string;
  data: FormData;
}) {
  return apiClient.post('/import/csv', payload.data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function exportData(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  format: string;
}) {
  return apiClient.post('/export', payload, { responseType: 'blob' });
}

export { apiClient, getToken, API_BASE_URL };
