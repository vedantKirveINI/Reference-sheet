import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      put: vi.fn(),
    },
  };
});

let apiClient: any;
let api: typeof import('../api');

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('accessToken', undefined);
  (window as any).accessToken = undefined;
  api = await import('../api');
  apiClient = (axios.create as any).mock.results[0]?.value;
  if (!apiClient) {
    apiClient = (axios as any).default?.create?.mock?.results[0]?.value;
  }
});

describe('api.ts - updateViewSort', () => {
  it('sends PUT to /view/update_sort with payload', async () => {
    const payload = {
      baseId: 'base-1',
      tableId: 'table-1',
      id: 'view-1',
      sort: { sortObjs: [{ fieldId: 1, order: 'asc', type: 'SHORT_TEXT' }], manualSort: false },
    };
    apiClient.put.mockResolvedValue({ data: { success: true } });
    await api.updateViewSort(payload);
    expect(apiClient.put).toHaveBeenCalledWith('/view/update_sort', { ...payload, should_stringify: true });
  });
});

describe('api.ts - updateViewFilter', () => {
  it('sends PUT to /view/update_filter with payload', async () => {
    const payload = { baseId: 'base-1', tableId: 'table-1', id: 'view-1', filter: { conjunction: 'and', filterSet: [] } };
    apiClient.put.mockResolvedValue({ data: { success: true } });
    await api.updateViewFilter(payload);
    expect(apiClient.put).toHaveBeenCalledWith('/view/update_filter', { ...payload, should_stringify: true });
  });
});

describe('api.ts - updateViewGroupBy', () => {
  it('sends PUT to /view/update_group_by', async () => {
    const payload = {
      baseId: 'base-1', tableId: 'table-1', id: 'view-1',
      groupBy: { groupObjs: [{ fieldId: 1, order: 'asc', type: 'SCQ' }] },
    };
    apiClient.put.mockResolvedValue({ data: {} });
    await api.updateViewGroupBy(payload);
    expect(apiClient.put).toHaveBeenCalledWith('/view/update_group_by', { ...payload, should_stringify: true });
  });
});

describe('api.ts - getGroupPoints', () => {
  it('sends GET to /record/group-points with params', async () => {
    const params = { baseId: 'base-1', tableId: 'table-1', viewId: 'view-1' };
    apiClient.get.mockResolvedValue({ data: { points: [] } });
    await api.getGroupPoints(params);
    expect(apiClient.get).toHaveBeenCalledWith('/record/group-points', { params });
  });
});

describe('api.ts - updateColumnMeta', () => {
  it('sends PUT to /view/update_column_meta', async () => {
    const payload = {
      baseId: 'base-1', tableId: 'table-1', viewId: 'view-1',
      columnMeta: [{ id: 1, width: 200 }],
    };
    apiClient.put.mockResolvedValue({ data: {} });
    await api.updateColumnMeta(payload);
    expect(apiClient.put).toHaveBeenCalledWith('/view/update_column_meta', payload);
  });
});

describe('api.ts - updateFieldsStatus', () => {
  it('sends POST to /field/update_fields_status', async () => {
    const payload = {
      baseId: 'base-1', tableId: 'table-1', viewId: 'view-1',
      fields: [{ id: 1, status: 'active' }],
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.updateFieldsStatus(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/field/update_fields_status', payload);
  });
});

describe('api.ts - createView', () => {
  it('sends POST to /view/create_view', async () => {
    const payload = { baseId: 'base-1', table_id: 'table-1', name: 'New View', type: 'grid' };
    apiClient.post.mockResolvedValue({ data: { id: 'view-2' } });
    const result = await api.createView(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/view/create_view', payload);
    expect(result.data.id).toBe('view-2');
  });

  it('includes optional fields when provided', async () => {
    const payload = {
      baseId: 'base-1', table_id: 'table-1', name: 'New View', type: 'kanban',
      version: 2, columnMeta: '{}', order: 3, options: { stackFieldId: 5 },
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.createView(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/view/create_view', payload);
  });
});

describe('api.ts - renameView', () => {
  it('sends POST to /view/update_view', async () => {
    const payload = { baseId: 'base-1', tableId: 'table-1', id: 'view-1', name: 'Renamed' };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.renameView(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/view/update_view', payload);
  });
});

describe('api.ts - deleteView', () => {
  it('sends POST to /view/delete_view', async () => {
    const payload = { baseId: 'base-1', tableId: 'table-1', viewId: 'view-1' };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.deleteView(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/view/delete_view', payload);
  });
});

describe('api.ts - fetchViews', () => {
  it('sends POST to /view/get_views', async () => {
    const payload = { baseId: 'base-1', tableId: 'table-1' };
    apiClient.post.mockResolvedValue({ data: { views: [] } });
    await api.fetchViews(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/view/get_views', payload);
  });
});

describe('api.ts - createTable', () => {
  it('sends POST to /table/create_table', async () => {
    const payload = { baseId: 'base-1', name: 'My Table' };
    apiClient.post.mockResolvedValue({ data: { id: 'table-2' } });
    const result = await api.createTable(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/table/create_table', payload);
    expect(result.data.id).toBe('table-2');
  });
});

describe('api.ts - createMultipleFields', () => {
  it('sends POST to /field/create_multiple_fields', async () => {
    const payload = {
      baseId: 'base-1', tableId: 'table-1',
      fields_payload: [
        { name: 'Name', type: 'SHORT_TEXT' },
        { name: 'Age', type: 'NUMBER' },
      ],
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.createMultipleFields(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/field/create_multiple_fields', payload);
  });

  it('includes optional viewId', async () => {
    const payload = {
      baseId: 'base-1', tableId: 'table-1', viewId: 'view-1',
      fields_payload: [{ name: 'Field', type: 'NUMBER' }],
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.createMultipleFields(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/field/create_multiple_fields', payload);
  });
});

describe('api.ts - renameTable', () => {
  it('sends PUT to /table/update_table with mapped payload', async () => {
    apiClient.put.mockResolvedValue({ data: {} });
    await api.renameTable({ baseId: 'base-1', tableId: 'table-1', name: 'New Name' });
    expect(apiClient.put).toHaveBeenCalledWith('/table/update_table', { baseId: 'base-1', id: 'table-1', name: 'New Name' });
  });
});

describe('api.ts - deleteTable', () => {
  it('sends PUT to /table/update_tables with inactive status', async () => {
    apiClient.put.mockResolvedValue({ data: {} });
    await api.deleteTable({ baseId: 'base-1', tableId: 'table-1' });
    expect(apiClient.put).toHaveBeenCalledWith('/table/update_tables', {
      baseId: 'base-1', whereObj: { id: ['table-1'] }, status: 'inactive',
    });
  });
});

describe('api.ts - createField', () => {
  it('sends POST to /field/create_field', async () => {
    const payload = { baseId: 'base-1', tableId: 'table-1', viewId: 'view-1', name: 'Field', type: 'SHORT_TEXT' };
    apiClient.post.mockResolvedValue({ data: { id: 5 } });
    await api.createField(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/field/create_field', payload);
  });

  it('includes optional fields', async () => {
    const payload = {
      baseId: 'base-1', tableId: 'table-1', viewId: 'view-1', name: 'Rating',
      type: 'RATING', order: 3, options: { maxRating: 5 }, description: 'Star rating',
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.createField(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/field/create_field', payload);
  });
});

describe('api.ts - updateField', () => {
  it('sends PUT to /field/update_field', async () => {
    const payload = {
      baseId: 'base-1', tableId: 'table-1', viewId: 'view-1', id: 5,
      name: 'Updated', type: 'NUMBER',
    };
    apiClient.put.mockResolvedValue({ data: {} });
    await api.updateField(payload);
    expect(apiClient.put).toHaveBeenCalledWith('/field/update_field', payload);
  });
});

describe('api.ts - getFileUploadUrl', () => {
  it('sends POST to /file/get-upload-url', async () => {
    const payload = {
      baseId: 'base-1', tableId: 'table-1', fieldId: 'field-1',
      recordId: 'rec-1', fileName: 'test.png', mimeType: 'image/png',
    };
    apiClient.post.mockResolvedValue({ data: { url: 'https://s3.example.com/upload' } });
    await api.getFileUploadUrl(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/file/get-upload-url', payload);
  });
});

describe('api.ts - uploadFileToPresignedUrl', () => {
  it('sends PUT to presigned URL with file', async () => {
    const file = new File(['data'], 'test.png', { type: 'image/png' });
    const url = 'https://s3.example.com/upload';
    (axios as any).put.mockResolvedValue({ data: {} });
    await api.uploadFileToPresignedUrl(url, file);
    expect((axios as any).put).toHaveBeenCalledWith(url, file, {
      headers: { 'Content-Type': 'image/png' },
    });
  });
});

describe('api.ts - confirmFileUpload', () => {
  it('sends POST to /file/confirm-upload', async () => {
    const payload = {
      baseId: 'base-1', tableId: 'table-1', fieldId: 'field-1', recordId: 'rec-1',
      files: [{ url: 'https://example.com/f.png', size: 1024, mimeType: 'image/png', name: 'f.png' }],
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.confirmFileUpload(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/file/confirm-upload', payload);
  });
});

describe('api.ts - updateSheetName', () => {
  it('sends PUT to /base/update_base_sheet_name', async () => {
    apiClient.put.mockResolvedValue({ data: {} });
    await api.updateSheetName({ baseId: 'base-1', name: 'New Sheet' });
    expect(apiClient.put).toHaveBeenCalledWith('/base/update_base_sheet_name', { baseId: 'base-1', name: 'New Sheet' });
  });
});

describe('api.ts - getShareMembers', () => {
  it('sends GET to /asset/get_members with asset_id param', async () => {
    apiClient.get.mockResolvedValue({ data: { members: [] } });
    await api.getShareMembers({ baseId: 'base-1' });
    expect(apiClient.get).toHaveBeenCalledWith('/asset/get_members', { params: { asset_id: 'base-1' } });
  });
});

describe('api.ts - inviteShareMember', () => {
  it('sends POST to /asset/invite_members', async () => {
    const payload = { baseId: 'base-1', email: 'user@test.com', role: 'editor' };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.inviteShareMember(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/asset/invite_members', payload);
  });
});

describe('api.ts - updateShareMemberRole', () => {
  it('sends PUT to /share/update-role', async () => {
    const payload = { baseId: 'base-1', userId: 'user-1', role: 'viewer' };
    apiClient.put.mockResolvedValue({ data: {} });
    await api.updateShareMemberRole(payload);
    expect(apiClient.put).toHaveBeenCalledWith('/share/update-role', payload);
  });
});

describe('api.ts - removeShareMember', () => {
  it('sends DELETE to /share/remove-member with data', async () => {
    const payload = { baseId: 'base-1', userId: 'user-1' };
    apiClient.delete.mockResolvedValue({ data: {} });
    await api.removeShareMember(payload);
    expect(apiClient.delete).toHaveBeenCalledWith('/share/remove-member', { data: payload });
  });
});

describe('api.ts - updateGeneralAccess', () => {
  it('sends POST to /asset/share', async () => {
    const payload = { baseId: 'base-1', access: 'public' };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.updateGeneralAccess(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/asset/share', payload);
  });
});

describe('api.ts - searchUsers', () => {
  it('sends GET to /user-sdk/search with params', async () => {
    apiClient.get.mockResolvedValue({ data: { users: [] } });
    await api.searchUsers({ query: 'john' });
    expect(apiClient.get).toHaveBeenCalledWith('/user-sdk/search', { params: { query: 'john' } });
  });

  it('passes additional params', async () => {
    apiClient.get.mockResolvedValue({ data: { users: [] } });
    await api.searchUsers({ query: 'john', limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith('/user-sdk/search', { params: { query: 'john', limit: 10 } });
  });
});

describe('api.ts - importToExistingTable', () => {
  it('sends POST to /table/add_csv_data_to_existing_table', async () => {
    const payload = {
      tableId: 'table-1', baseId: 'base-1', viewId: 'view-1',
      is_first_row_header: true, url: 'https://example.com/data.csv',
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.importToExistingTable(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/table/add_csv_data_to_existing_table', payload);
  });

  it('includes columns_info when provided', async () => {
    const payload = {
      tableId: 'table-1', baseId: 'base-1', viewId: 'view-1',
      is_first_row_header: true, url: 'https://example.com/data.csv',
      columns_info: [{ dbFieldName: 'field_1', name: 'Name', type: 'SHORT_TEXT' }],
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.importToExistingTable(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/table/add_csv_data_to_existing_table', payload);
  });
});

describe('api.ts - importToNewTable', () => {
  it('sends POST to /table/add_csv_data_to_new_table', async () => {
    const payload = {
      table_name: 'Imported Table', baseId: 'base-1', user_id: 'user-1',
      is_first_row_header: true, url: 'https://example.com/data.csv',
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.importToNewTable(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/table/add_csv_data_to_new_table', payload);
  });
});

describe('api.ts - exportData', () => {
  it('sends POST to /table/export_data_to_csv with blob responseType', async () => {
    const payload = { baseId: 'base-1', tableId: 'table-1', viewId: 'view-1' };
    apiClient.post.mockResolvedValue({ data: new Blob() });
    await api.exportData(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/table/export_data_to_csv', payload, { responseType: 'blob' });
  });
});

describe('api.ts - uploadCSVForImport', () => {
  it('sends POST to /file/upload-csv with FormData', async () => {
    const file = new File(['a,b,c'], 'test.csv', { type: 'text/csv' });
    apiClient.post.mockResolvedValue({ data: { url: 'https://example.com/uploaded.csv' } });
    const result = await api.uploadCSVForImport(file);
    expect(result).toBe('https://example.com/uploaded.csv');
    const uploadCall = apiClient.post.mock.calls.find((c: any) => c[0] === '/file/upload-csv');
    expect(uploadCall).toBeDefined();
    expect(uploadCall![1]).toBeInstanceOf(FormData);
    expect(uploadCall![2]).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
  });

  it('returns raw data when no url property', async () => {
    const file = new File(['a'], 'test.csv', { type: 'text/csv' });
    apiClient.post.mockResolvedValue({ data: 'https://direct-url.com/file.csv' });
    const result = await api.uploadCSVForImport(file);
    expect(result).toBe('https://direct-url.com/file.csv');
  });
});

describe('api.ts - getComments', () => {
  it('sends GET to /comment/list and maps comments', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        comments: [
          { id: 'c1', content: 'Hello', user_id: 'u1', user_name: 'Alice', user_avatar: 'avatar.png' },
        ],
      },
    });
    const result = await api.getComments({ tableId: 'table-1', recordId: 'rec-1' });
    expect(apiClient.get).toHaveBeenCalledWith('/comment/list', { params: { tableId: 'table-1', recordId: 'rec-1' } });
    expect(result.data.comments[0].created_by).toEqual({
      id: 'u1', name: 'Alice', email: '', avatar: 'avatar.png',
    });
  });

  it('handles empty user fields in mapComment', async () => {
    apiClient.get.mockResolvedValue({
      data: { comments: [{ id: 'c2', content: 'Hi' }] },
    });
    const result = await api.getComments({ tableId: 'table-1', recordId: 'rec-1' });
    expect(result.data.comments[0].created_by).toEqual({
      id: '', name: '', email: '', avatar: null,
    });
  });

  it('passes cursor and limit params', async () => {
    apiClient.get.mockResolvedValue({ data: { comments: [] } });
    await api.getComments({ tableId: 'table-1', recordId: 'rec-1', cursor: 'abc', limit: 20 });
    expect(apiClient.get).toHaveBeenCalledWith('/comment/list', {
      params: { tableId: 'table-1', recordId: 'rec-1', cursor: 'abc', limit: 20 },
    });
  });
});

describe('api.ts - getCommentCount', () => {
  it('sends GET to /comment/count', async () => {
    apiClient.get.mockResolvedValue({ data: { count: 5 } });
    await api.getCommentCount({ tableId: 'table-1', recordId: 'rec-1' });
    expect(apiClient.get).toHaveBeenCalledWith('/comment/count', { params: { tableId: 'table-1', recordId: 'rec-1' } });
  });
});

describe('api.ts - getCommentCountsByTable', () => {
  it('sends GET to /comment/counts-by-table', async () => {
    apiClient.get.mockResolvedValue({ data: { counts: { 'rec-1': 3, 'rec-2': 1 } } });
    const result = await api.getCommentCountsByTable({ tableId: 'table-1' });
    expect(apiClient.get).toHaveBeenCalledWith('/comment/counts-by-table', { params: { tableId: 'table-1' } });
    expect(result.data.counts).toEqual({ 'rec-1': 3, 'rec-2': 1 });
  });
});

describe('api.ts - createComment', () => {
  it('sends POST to /comment/create and maps result', async () => {
    apiClient.post.mockResolvedValue({
      data: { id: 'c3', content: 'New comment', user_id: 'u1', user_name: 'Bob', user_avatar: null },
    });
    const result = await api.createComment({ tableId: 'table-1', recordId: 'rec-1', content: 'New comment' });
    expect(apiClient.post).toHaveBeenCalledWith('/comment/create', {
      tableId: 'table-1', recordId: 'rec-1', content: 'New comment',
    });
    expect(result.data.created_by.name).toBe('Bob');
    expect(result.data.created_by.avatar).toBeNull();
  });

  it('includes parentId for replies', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 'c4', content: 'Reply' } });
    await api.createComment({ tableId: 'table-1', recordId: 'rec-1', content: 'Reply', parentId: 'c3' });
    expect(apiClient.post).toHaveBeenCalledWith('/comment/create', {
      tableId: 'table-1', recordId: 'rec-1', content: 'Reply', parentId: 'c3',
    });
  });
});

describe('api.ts - updateComment', () => {
  it('sends PATCH to /comment/update', async () => {
    apiClient.patch.mockResolvedValue({ data: {} });
    await api.updateComment({ commentId: 'c1', content: 'Updated' });
    expect(apiClient.patch).toHaveBeenCalledWith('/comment/update', { commentId: 'c1', content: 'Updated' });
  });
});

describe('api.ts - deleteComment', () => {
  it('sends DELETE to /comment/delete/:id', async () => {
    apiClient.delete.mockResolvedValue({ data: {} });
    await api.deleteComment('c1');
    expect(apiClient.delete).toHaveBeenCalledWith('/comment/delete/c1');
  });
});

describe('api.ts - addCommentReaction', () => {
  it('sends POST to /comment/reaction/add', async () => {
    apiClient.post.mockResolvedValue({ data: {} });
    await api.addCommentReaction({ commentId: 'c1', emoji: '👍' });
    expect(apiClient.post).toHaveBeenCalledWith('/comment/reaction/add', { commentId: 'c1', emoji: '👍' });
  });
});

describe('api.ts - removeCommentReaction', () => {
  it('sends POST to /comment/reaction/remove', async () => {
    apiClient.post.mockResolvedValue({ data: {} });
    await api.removeCommentReaction({ commentId: 'c1', emoji: '👍' });
    expect(apiClient.post).toHaveBeenCalledWith('/comment/reaction/remove', { commentId: 'c1', emoji: '👍' });
  });
});

describe('api.ts - triggerButtonClick', () => {
  it('sends POST to /field/button_click', async () => {
    const payload = { tableId: 'table-1', recordId: 'rec-1', fieldId: 'field-1', baseId: 'base-1' };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.triggerButtonClick(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/field/button_click', payload);
  });
});

describe('api.ts - updateLinkCell', () => {
  it('sends POST to /field/update_link_cell', async () => {
    const params = { tableId: 'table-1', baseId: 'base-1', fieldId: 1, recordId: 1, linkedRecordIds: [2, 3] };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.updateLinkCell(params);
    expect(apiClient.post).toHaveBeenCalledWith('/field/update_link_cell', params);
  });
});

describe('api.ts - searchForeignRecords', () => {
  it('sends POST to /record/get_records with base and table', async () => {
    apiClient.post.mockResolvedValue({ data: { records: [] } });
    await api.searchForeignRecords({ baseId: 'base-1', tableId: 'table-2', query: 'search' });
    expect(apiClient.post).toHaveBeenCalledWith('/record/get_records', { baseId: 'base-1', tableId: 'table-2' });
  });
});

describe('api.ts - getForeignTableFields', () => {
  it('sends GET to /field/getFields with tableId', async () => {
    apiClient.get.mockResolvedValue({ data: { fields: [] } });
    await api.getForeignTableFields({ tableId: 'table-2' });
    expect(apiClient.get).toHaveBeenCalledWith('/field/getFields', { params: { tableId: 'table-2' } });
  });
});

describe('api.ts - getForeignTableRecord', () => {
  it('sends POST to /record/get_record with filter for record id', async () => {
    apiClient.post.mockResolvedValue({ data: { record: {} } });
    await api.getForeignTableRecord({ baseId: 'base-1', tableId: 'table-1', recordId: 42 });
    expect(apiClient.post).toHaveBeenCalledWith('/record/get_record', {
      baseId: 'base-1', tableId: 'table-1',
      manual_filters: {
        conjunction: 'and',
        filterSet: [{ fieldId: '__id', operator: 'is', value: '42' }],
      },
    });
  });
});

describe('api.ts - updateRecordColors', () => {
  it('sends POST to /record/update_record_colors', async () => {
    const payload = { tableId: 'table-1', baseId: 'base-1', rowId: 1, rowColor: '#ff0000', cellColors: { col1: '#00ff00' } };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.updateRecordColors(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/record/update_record_colors', payload);
  });

  it('accepts null colors', async () => {
    const payload = { tableId: 'table-1', baseId: 'base-1', rowId: 1, rowColor: null, cellColors: null };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.updateRecordColors(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/record/update_record_colors', payload);
  });
});

describe('api.ts - getRecordHistory', () => {
  it('sends GET to /record/history with params', async () => {
    apiClient.get.mockResolvedValue({ data: { history: [] } });
    await api.getRecordHistory({ baseId: 'base-1', tableId: 'table-1', recordId: 'rec-1' });
    expect(apiClient.get).toHaveBeenCalledWith('/record/history', {
      params: { baseId: 'base-1', tableId: 'table-1', recordId: 'rec-1', page: 1, pageSize: 50 },
    });
  });

  it('uses provided page and pageSize', async () => {
    apiClient.get.mockResolvedValue({ data: { history: [] } });
    await api.getRecordHistory({ baseId: 'base-1', tableId: 'table-1', recordId: 'rec-1', page: 3, pageSize: 10 });
    expect(apiClient.get).toHaveBeenCalledWith('/record/history', {
      params: { baseId: 'base-1', tableId: 'table-1', recordId: 'rec-1', page: 3, pageSize: 10 },
    });
  });
});

describe('api.ts - createEnrichmentField', () => {
  it('sends POST to /field/create_enrichment_field', async () => {
    const payload = {
      tableId: 'table-1', baseId: 'base-1', name: 'Enrichment',
      type: 'ENRICHMENT' as const, entityType: 'Company',
      identifier: [{ fieldId: 1 }], fieldsToEnrich: [{ key: 'industry' }],
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.createEnrichmentField(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/field/create_enrichment_field', payload);
  });
});

describe('api.ts - updateEnrichmentField', () => {
  it('sends POST to /field/update_enrichment_field', async () => {
    const payload = {
      id: 5, tableId: 'table-1', baseId: 'base-1',
      options: { entityType: 'Person', autoUpdate: true },
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.updateEnrichmentField(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/field/update_enrichment_field', payload);
  });
});

describe('api.ts - processEnrichment', () => {
  it('sends POST to /record/v1/enrichment/process_enrichment', async () => {
    const payload = {
      tableId: 'table-1', baseId: 'base-1', viewId: 'view-1', id: 'rec-1', enrichedFieldId: 5,
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.processEnrichment(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/record/v1/enrichment/process_enrichment', payload);
  });
});

describe('api.ts - processEnrichmentForAll', () => {
  it('sends POST to /record/v1/enrichment/process_enrichment_for_all', async () => {
    const payload = {
      tableId: 'table-1', baseId: 'base-1', viewId: 'view-1', enrichedFieldId: 5,
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.processEnrichmentForAll(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/record/v1/enrichment/process_enrichment_for_all', payload);
  });

  it('includes optional batchSize', async () => {
    const payload = {
      tableId: 'table-1', baseId: 'base-1', viewId: 'view-1', enrichedFieldId: 5, batchSize: 100,
    };
    apiClient.post.mockResolvedValue({ data: {} });
    await api.processEnrichmentForAll(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/record/v1/enrichment/process_enrichment_for_all', payload);
  });
});

describe('api.ts - exports', () => {
  it('exports apiClient', () => {
    expect(api.apiClient).toBeDefined();
  });

  it('exports getToken', () => {
    expect(api.getToken).toBeTypeOf('function');
  });

  it('exports API_BASE_URL', () => {
    expect(api.API_BASE_URL).toBeDefined();
  });
});

describe('api.ts - error handling', () => {
  it('propagates network errors from apiClient', async () => {
    const error = new Error('Network Error');
    apiClient.post.mockRejectedValue(error);
    await expect(api.createTable({ baseId: 'base-1', name: 'Table' })).rejects.toThrow('Network Error');
  });

  it('propagates HTTP errors from apiClient', async () => {
    const error = { response: { status: 404, data: { message: 'Not found' } } };
    apiClient.get.mockRejectedValue(error);
    await expect(api.getShareMembers({ baseId: 'nonexistent' })).rejects.toEqual(error);
  });

  it('propagates 500 errors', async () => {
    const error = { response: { status: 500, data: { message: 'Internal server error' } } };
    apiClient.put.mockRejectedValue(error);
    await expect(api.updateField({
      baseId: 'base-1', tableId: 'table-1', viewId: 'view-1', id: 1,
    })).rejects.toEqual(error);
  });

  it('propagates 401 unauthorized', async () => {
    const error = { response: { status: 401, data: { message: 'Unauthorized' } } };
    apiClient.post.mockRejectedValue(error);
    await expect(api.createComment({
      tableId: 'table-1', recordId: 'rec-1', content: 'test',
    })).rejects.toEqual(error);
  });

  it('propagates 403 forbidden', async () => {
    const error = { response: { status: 403, data: { message: 'Forbidden' } } };
    apiClient.delete.mockRejectedValue(error);
    await expect(api.deleteComment('c1')).rejects.toEqual(error);
  });
});
