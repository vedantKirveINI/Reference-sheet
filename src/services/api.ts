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
  return apiClient.put('/view/update_sort', payload);
}

export async function updateViewFilter(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  filter: any;
}) {
  return apiClient.put('/view/update_filter', payload);
}

export async function updateViewGroupBy(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  groupBy: { groupObjs: Array<{ fieldId: string; order: string; dbFieldName?: string; type?: string }> };
}) {
  return apiClient.put('/view/update_group_by', payload);
}

export async function updateColumnMeta(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  columnMeta: Record<string, any>;
}) {
  return apiClient.put('/view/update_column_meta', payload);
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
  table_id: string;
  name: string;
  type: string;
  version?: number;
  columnMeta?: string;
  order?: number;
  options?: Record<string, any>;
}) {
  return apiClient.post('/view/create_view', payload);
}

export async function renameView(payload: {
  baseId: string;
  tableId: string;
  id: string;
  name: string;
}) {
  return apiClient.post('/view/update_view', payload);
}

export async function deleteView(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
}) {
  return apiClient.post('/view/delete_view', payload);
}

export async function fetchViews(payload: {
  baseId: string;
  tableId: string;
}) {
  return apiClient.post('/view/get_views', payload);
}

export async function createTable(payload: {
  baseId: string;
  name: string;
}) {
  return apiClient.post('/table/create_table', payload);
}

export async function renameTable(payload: {
  baseId: string;
  tableId: string;
  name: string;
}) {
  return apiClient.put('/table/update_table', { baseId: payload.baseId, id: payload.tableId, name: payload.name });
}

export async function deleteTable(payload: {
  baseId: string;
  tableId: string;
}) {
  return apiClient.put('/table/update_tables', { baseId: payload.baseId, whereObj: { id: [payload.tableId] }, status: "inactive" });
}

export async function createField(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  name: string;
  type: string;
  order?: number;
  options?: any;
  description?: string;
}) {
  return apiClient.post('/field/create_field', payload);
}

export async function updateField(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
  id: string | number;
  name?: string;
  type?: string;
  order?: number;
  options?: any;
  description?: string;
}) {
  return apiClient.put('/field/update_field', payload);
}

// NOTE: The legacy app uses a SEPARATE file upload server (serverConfig.FILE_UPLOAD_SERVER),
// not the main API. The endpoint is POST {FILE_UPLOAD_SERVER}/upload with { fileName, fileType }.
// The current implementation may need the correct FILE_UPLOAD_SERVER URL to work properly.
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
  return apiClient.put('/base/update_base_sheet_name', payload);
}

export async function getShareMembers(payload: { baseId: string }) {
  return apiClient.get('/asset/get_members', { params: { asset_id: payload.baseId } });
}

export async function inviteShareMember(payload: {
  baseId: string;
  email: string;
  role: string;
}) {
  return apiClient.post('/asset/invite_members', payload);
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
  return apiClient.post('/asset/share', payload);
}

export async function searchUsers(params: { query: string; [key: string]: any }) {
  return apiClient.get('/user-sdk/search', { params });
}

export interface ColumnInfo {
  dbFieldName?: string;
  field_id?: number;
  name?: string;
  type?: string;
  prev_index?: number;
  new_index?: number;
  meta?: { width?: number; text_wrap?: string };
}

export async function importToExistingTable(payload: {
  tableId: string;
  baseId: string;
  viewId: string;
  is_first_row_header: boolean;
  url: string;
  columns_info?: ColumnInfo[];
}) {
  return apiClient.post('/table/add_csv_data_to_existing_table', payload);
}

export async function importToNewTable(payload: {
  table_name: string;
  baseId: string;
  user_id: string;
  is_first_row_header: boolean;
  url: string;
  columns_info?: ColumnInfo[];
}) {
  return apiClient.post('/table/add_csv_data_to_new_table', payload);
}

export async function exportData(payload: {
  baseId: string;
  tableId: string;
  viewId: string;
}) {
  return apiClient.post('/table/export_data_to_csv', payload, { responseType: 'blob' });
}

export async function uploadCSVForImport(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/file/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.url || res.data;
}

function mapComment(c: any) {
  return {
    ...c,
    created_by: {
      id: c.user_id || '',
      name: c.user_name || '',
      email: '',
      avatar: c.user_avatar || null,
    },
  };
}

export async function getComments(params: {
  tableId: string;
  recordId: string;
  cursor?: string;
  limit?: number;
}) {
  const res = await apiClient.get('/comment/list', { params });
  if (res.data?.comments) {
    res.data.comments = res.data.comments.map(mapComment);
  }
  return res;
}

export async function getCommentCount(params: {
  tableId: string;
  recordId: string;
}) {
  return apiClient.get('/comment/count', { params });
}

export async function createComment(payload: {
  tableId: string;
  recordId: string;
  content: string;
  parentId?: string;
}) {
  const res = await apiClient.post('/comment/create', payload);
  if (res.data) {
    res.data = mapComment(res.data);
  }
  return res;
}

export async function updateComment(payload: {
  commentId: string;
  content: string;
}) {
  return apiClient.patch('/comment/update', payload);
}

export async function deleteComment(commentId: string) {
  return apiClient.delete(`/comment/delete/${commentId}`);
}

export async function addCommentReaction(payload: {
  commentId: string;
  emoji: string;
}) {
  return apiClient.post('/comment/reaction/add', payload);
}

export async function removeCommentReaction(payload: {
  commentId: string;
  emoji: string;
}) {
  return apiClient.post('/comment/reaction/remove', payload);
}

export async function triggerButtonClick(payload: {
  tableId: string;
  recordId: string;
  fieldId: string;
}) {
  return apiClient.post('/record/button-click', payload);
}

export async function updateLinkCell(params: {
  tableId: string;
  baseId: string;
  fieldId: number;
  recordId: number;
  linkedRecordIds: number[];
}): Promise<any> {
  return apiClient.post('/field/update_link_cell', params);
}

export async function searchForeignRecords(params: {
  baseId: string;
  tableId: string;
  query: string;
}): Promise<any> {
  return apiClient.post('/record/get_records', {
    baseId: params.baseId,
    tableId: params.tableId,
  });
}

export async function getForeignTableFields(params: {
  tableId: string;
}): Promise<any> {
  return apiClient.get('/field/getFields', { params: { tableId: params.tableId } });
}

export async function getForeignTableRecord(params: {
  baseId: string;
  tableId: string;
  recordId: number;
}): Promise<any> {
  return apiClient.post('/record/v2/get_record', {
    baseId: params.baseId,
    tableId: params.tableId,
    limit: 1,
    manual_filters: {
      conjunction: 'and',
      filterSet: [
        { fieldId: '__id', operator: 'is', value: String(params.recordId) }
      ]
    }
  });
}

export { apiClient, getToken, API_BASE_URL };
