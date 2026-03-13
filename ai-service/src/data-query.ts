import { Pool } from 'pg';

// ─── Identifier safety ───────────────────────────────────────────────────────

const SAFE_IDENTIFIER = /^[a-zA-Z0-9_\-]+$/;

/** Validates that a string is safe to use as a SQL identifier (no injection risk). */
function assertSafeIdentifier(value: string, label: string): void {
  if (!value || !SAFE_IDENTIFIER.test(value)) {
    throw new Error(`Unsafe ${label}: "${value}"`);
  }
}

/** Properly quotes a db_table_name that may contain schema.table format (e.g. "baseId.tableId") */
function quoteTableName(dbTableName: string): string {
  if (dbTableName.includes('.')) {
    const [schema, table] = dbTableName.split('.', 2);
    assertSafeIdentifier(schema, 'schema name');
    assertSafeIdentifier(table, 'table name');
    return `"${schema}"."${table}"`;
  }
  assertSafeIdentifier(dbTableName, 'table name');
  return `"${dbTableName}"`;
}

// ─── User authorization ──────────────────────────────────────────────────────

/**
 * Validates that a user has access to a base by checking the ownership chain:
 * user → space (created_by) → base (space_id).
 * Throws if the user does not belong to the space that owns the base.
 */
export async function validateUserBaseAccess(pool: Pool, userId: string, baseId: string): Promise<void> {
  const result = await pool.query(
    `SELECT 1 FROM base b
     JOIN space s ON b.space_id = s.id
     WHERE b.id = $1 AND s.created_by = $2 AND b.status = 'active'`,
    [baseId, userId]
  );
  if (result.rows.length === 0) {
    throw new Error(`Access denied: user does not have permission to access base ${baseId}`);
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FieldSchema {
  id: number;
  name: string;
  type: string;
  dbFieldName: string;
  dbFieldType: string;
  options: any;
}

export interface QueryCondition {
  fieldDbName: string;
  operator: string;
  value: any;
}

export interface OrderByClause {
  fieldDbName: string;
  order: 'asc' | 'desc';
}

export async function getTableSchema(pool: Pool, tableId: string): Promise<FieldSchema[]> {
  const result = await pool.query(
    `SELECT id, name, type, db_field_name, db_field_type, options
     FROM field
     WHERE "tableMetaId" = $1 AND status = 'active'
     ORDER BY id ASC`,
    [tableId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    dbFieldName: row.db_field_name,
    dbFieldType: row.db_field_type,
    options: row.options,
  }));
}

export async function queryTableData(
  pool: Pool,
  userId: string,
  baseId: string,
  tableId: string,
  conditions: QueryCondition[] = [],
  limit: number = 100,
  orderBy?: OrderByClause[]
): Promise<{ fields: FieldSchema[]; records: Record<string, any>[] }> {
  await validateUserBaseAccess(pool, userId, baseId);

  const tableResult = await pool.query(
    `SELECT db_table_name, base_id FROM table_meta WHERE id = $1 AND status = 'active'`,
    [tableId]
  );

  if (tableResult.rows.length === 0) {
    throw new Error(`Table ${tableId} not found`);
  }

  const tableMeta = tableResult.rows[0];

  if (tableMeta.base_id !== baseId) {
    throw new Error('Security violation: baseId does not match the table\'s baseId');
  }

  const dbTableName = tableMeta.db_table_name;
  if (!dbTableName) {
    throw new Error(`Table ${tableId} has no physical table name`);
  }

  const fields = await getTableSchema(pool, tableId);

  const fieldMap = new Map<string, FieldSchema>();
  for (const f of fields) {
    fieldMap.set(f.dbFieldName, f);
  }

  const validDbFieldNames = new Set(fields.map((f) => f.dbFieldName));

  let whereClause = '';
  const params: any[] = [];
  if (conditions.length > 0) {
    const whereParts: string[] = [];
    for (const cond of conditions) {
      if (!validDbFieldNames.has(cond.fieldDbName)) {
        continue;
      }
      const paramIndex = params.length + 1;
      const quotedField = `"${cond.fieldDbName}"`;
      switch (cond.operator) {
        case 'equals':
        case '=':
          whereParts.push(`${quotedField} = $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'not_equals':
        case '!=':
          whereParts.push(`${quotedField} != $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'contains':
          whereParts.push(`${quotedField}::text ILIKE $${paramIndex}`);
          params.push(`%${cond.value}%`);
          break;
        case 'not_contains':
          whereParts.push(`${quotedField}::text NOT ILIKE $${paramIndex}`);
          params.push(`%${cond.value}%`);
          break;
        case 'greater_than':
        case '>':
          whereParts.push(`${quotedField} > $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'less_than':
        case '<':
          whereParts.push(`${quotedField} < $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'greater_or_equal':
        case '>=':
          whereParts.push(`${quotedField} >= $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'less_or_equal':
        case '<=':
          whereParts.push(`${quotedField} <= $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'is_empty':
          whereParts.push(`(${quotedField} IS NULL OR ${quotedField}::text = '')`);
          break;
        case 'is_not_empty':
          whereParts.push(`(${quotedField} IS NOT NULL AND ${quotedField}::text != '')`);
          break;
        default:
          whereParts.push(`${quotedField} = $${paramIndex}`);
          params.push(cond.value);
          break;
      }
    }
    if (whereParts.length > 0) {
      whereClause = ' WHERE ' + whereParts.join(' AND ');
    }
  }

  let orderClause = '';
  if (orderBy && orderBy.length > 0) {
    const orderParts: string[] = [];
    for (const ob of orderBy) {
      if (validDbFieldNames.has(ob.fieldDbName)) {
        const direction = ob.order === 'desc' ? 'DESC' : 'ASC';
        orderParts.push(`"${ob.fieldDbName}" ${direction}`);
      }
    }
    if (orderParts.length > 0) {
      orderClause = ' ORDER BY ' + orderParts.join(', ');
    }
  }

  const safeLimit = Math.min(Math.max(1, limit), 1000);
  const limitParamIndex = params.length + 1;
  params.push(safeLimit);

  const query = `SELECT * FROM ${quoteTableName(dbTableName)}${whereClause}${orderClause} LIMIT $${limitParamIndex}`;

  const dataResult = await pool.query(query, params);

  const records = dataResult.rows.map((row) => {
    const mapped: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      const field = fieldMap.get(key);
      if (field) {
        mapped[field.name] = value;
      } else {
        mapped[key] = value;
      }
    }
    return mapped;
  });

  return { fields, records };
}

export interface BaseWithTables {
  id: string;
  name: string;
  tables: {
    id: string;
    name: string;
    fields: { id: number; name: string; type: string; dbFieldName: string }[];
  }[];
}

export async function getAllAccessibleBases(pool: Pool): Promise<BaseWithTables[]> {
  const basesResult = await pool.query(
    `SELECT id, name FROM base WHERE status = 'active' ORDER BY name ASC`
  );

  const bases: BaseWithTables[] = [];

  for (const base of basesResult.rows) {
    const tablesResult = await pool.query(
      `SELECT id, name FROM table_meta WHERE base_id = $1 AND status = 'active' ORDER BY "order" ASC`,
      [base.id]
    );

    const tables = [];
    for (const table of tablesResult.rows) {
      const fieldsResult = await pool.query(
        `SELECT id, name, type, db_field_name FROM field WHERE "tableMetaId" = $1 AND status = 'active' ORDER BY id ASC`,
        [table.id]
      );
      tables.push({
        id: table.id,
        name: table.name,
        fields: fieldsResult.rows.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          dbFieldName: f.db_field_name,
        })),
      });
    }

    bases.push({
      id: base.id,
      name: base.name,
      tables,
    });
  }

  return bases;
}

// ─── Write operations — routed through sheets-backend (never direct DB writes) ──

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4545';

async function backendPost(path: string, body: any, token?: string): Promise<any> {
  const axios = require('axios');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['token'] = token;
  const res = await axios.post(`${BACKEND_URL}${path}`, body, { headers, timeout: 30000 });
  return res.data;
}

export async function createRecord(
  pool: Pool,
  userId: string,
  baseId: string,
  tableId: string,
  fieldValues: Record<string, any>,
  token?: string
): Promise<{ id: string }> {
  await validateUserBaseAccess(pool, userId, baseId);
  const fields = await getTableSchema(pool, tableId);
  const validDbFieldNames = new Set(fields.map(f => f.dbFieldName));

  // Filter to only valid field names
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(fieldValues)) {
    if (validDbFieldNames.has(key)) sanitized[key] = value;
  }
  if (Object.keys(sanitized).length === 0) throw new Error('No valid fields provided');

  const result = await backendPost('/api/record/create_record', {
    baseId,
    tableId,
    record: sanitized,
  }, token);

  return { id: result?.record?.__id || result?.id || 'created' };
}

export async function updateRecord(
  pool: Pool,
  userId: string,
  baseId: string,
  tableId: string,
  recordId: string,
  fieldValues: Record<string, any>,
  token?: string
): Promise<void> {
  await validateUserBaseAccess(pool, userId, baseId);
  const fields = await getTableSchema(pool, tableId);
  const validDbFieldNames = new Set(fields.map(f => f.dbFieldName));

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(fieldValues)) {
    if (validDbFieldNames.has(key)) sanitized[key] = value;
  }
  if (Object.keys(sanitized).length === 0) throw new Error('No valid fields provided');

  await backendPost('/api/record/update_record', {
    baseId,
    tableId,
    recordId,
    record: sanitized,
  }, token);
}

export interface SummarizeCondition {
  fieldDbName: string;
  operator: string;
  value?: any;
}

export interface SummarizeRequest {
  baseId: string;
  tableId: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'count_distinct';
  fieldDbName?: string;
  groupByFields?: string[];
  conditions?: SummarizeCondition[];
}

export async function summarizeTableData(
  pool: Pool,
  userId: string,
  request: SummarizeRequest
): Promise<{ results: Record<string, any>[]; summary: string }> {
  await validateUserBaseAccess(pool, userId, request.baseId);

  const tableResult = await pool.query(
    `SELECT db_table_name, base_id FROM table_meta WHERE id = $1 AND status = 'active'`,
    [request.tableId]
  );
  if (tableResult.rows.length === 0) throw new Error(`Table ${request.tableId} not found`);
  if (tableResult.rows[0].base_id !== request.baseId) throw new Error('Security violation: baseId mismatch');

  const dbTableName = tableResult.rows[0].db_table_name;
  if (!dbTableName) throw new Error(`Table ${request.tableId} has no physical table name`);

  const fields = await getTableSchema(pool, request.tableId);
  const fieldMap = new Map<string, FieldSchema>();
  for (const f of fields) {
    fieldMap.set(f.dbFieldName, f);
  }
  const validDbFieldNames = new Set(fields.map(f => f.dbFieldName));

  if (request.aggregation !== 'count' && !request.fieldDbName) {
    throw new Error(`fieldDbName is required for ${request.aggregation} aggregation`);
  }
  if (request.fieldDbName && !validDbFieldNames.has(request.fieldDbName)) {
    throw new Error(`Invalid field: ${request.fieldDbName}`);
  }

  let aggExpr: string;
  const aggField = request.fieldDbName ? `"${request.fieldDbName}"` : '*';
  switch (request.aggregation) {
    case 'count':
      aggExpr = request.fieldDbName ? `COUNT("${request.fieldDbName}")` : 'COUNT(*)';
      break;
    case 'sum':
      aggExpr = `SUM(${aggField}::numeric)`;
      break;
    case 'avg':
      aggExpr = `AVG(${aggField}::numeric)`;
      break;
    case 'min':
      aggExpr = `MIN(${aggField})`;
      break;
    case 'max':
      aggExpr = `MAX(${aggField})`;
      break;
    case 'count_distinct':
      aggExpr = `COUNT(DISTINCT ${aggField})`;
      break;
    default:
      throw new Error(`Unknown aggregation: ${request.aggregation}`);
  }

  const params: any[] = [];
  let whereClause = '';
  if (request.conditions && request.conditions.length > 0) {
    const whereParts: string[] = [];
    for (const cond of request.conditions) {
      if (!validDbFieldNames.has(cond.fieldDbName)) continue;
      const paramIndex = params.length + 1;
      const quotedField = `"${cond.fieldDbName}"`;
      switch (cond.operator) {
        case 'equals':
        case '=':
          whereParts.push(`${quotedField} = $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'not_equals':
        case '!=':
          whereParts.push(`${quotedField} != $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'contains':
          whereParts.push(`${quotedField}::text ILIKE $${paramIndex}`);
          params.push(`%${cond.value}%`);
          break;
        case 'not_contains':
          whereParts.push(`${quotedField}::text NOT ILIKE $${paramIndex}`);
          params.push(`%${cond.value}%`);
          break;
        case 'greater_than':
        case '>':
          whereParts.push(`${quotedField} > $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'less_than':
        case '<':
          whereParts.push(`${quotedField} < $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'greater_or_equal':
        case '>=':
          whereParts.push(`${quotedField} >= $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'less_or_equal':
        case '<=':
          whereParts.push(`${quotedField} <= $${paramIndex}`);
          params.push(cond.value);
          break;
        case 'is_empty':
          whereParts.push(`(${quotedField} IS NULL OR ${quotedField}::text = '')`);
          break;
        case 'is_not_empty':
          whereParts.push(`(${quotedField} IS NOT NULL AND ${quotedField}::text != '')`);
          break;
        default:
          whereParts.push(`${quotedField} = $${paramIndex}`);
          params.push(cond.value);
          break;
      }
    }
    if (whereParts.length > 0) {
      whereClause = ' WHERE ' + whereParts.join(' AND ');
    }
  }

  let groupByClause = '';
  let selectParts: string[] = [];
  const validGroupByFields: string[] = [];

  if (request.groupByFields && request.groupByFields.length > 0) {
    for (const gf of request.groupByFields) {
      if (validDbFieldNames.has(gf)) {
        validGroupByFields.push(gf);
      }
    }
    if (validGroupByFields.length > 0) {
      selectParts = validGroupByFields.map(gf => `"${gf}"`);
      groupByClause = ' GROUP BY ' + validGroupByFields.map(gf => `"${gf}"`).join(', ');
    }
  }

  selectParts.push(`${aggExpr} AS result`);

  const query = `SELECT ${selectParts.join(', ')} FROM ${quoteTableName(dbTableName)}${whereClause}${groupByClause} ORDER BY result DESC LIMIT 1000`;

  const dataResult = await pool.query(query, params);

  const results = dataResult.rows.map(row => {
    const mapped: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      if (key === 'result') {
        mapped.result = value;
      } else {
        const field = fieldMap.get(key);
        mapped[field ? field.name : key] = value;
      }
    }
    return mapped;
  });

  const aggFieldName = request.fieldDbName ? (fieldMap.get(request.fieldDbName)?.name || request.fieldDbName) : 'records';
  let summary: string;
  if (validGroupByFields.length > 0) {
    const groupNames = validGroupByFields.map(gf => fieldMap.get(gf)?.name || gf).join(', ');
    summary = `${request.aggregation.toUpperCase()} of ${aggFieldName} grouped by ${groupNames}: ${results.length} group(s)`;
  } else if (results.length === 1) {
    summary = `${request.aggregation.toUpperCase()} of ${aggFieldName}: ${results[0].result}`;
  } else {
    summary = `${request.aggregation.toUpperCase()} of ${aggFieldName}: no results`;
  }

  return { results, summary };
}

export async function deleteRecord(
  pool: Pool,
  userId: string,
  baseId: string,
  tableId: string,
  recordId: string,
  token?: string
): Promise<void> {
  await validateUserBaseAccess(pool, userId, baseId);
  await backendPost('/api/record/update_records_status', {
    baseId,
    tableId,
    recordIds: [recordId],
    status: 'deleted',
  }, token);
}

export interface BulkUpdateRequest {
  baseId: string;
  tableId: string;
  conditions: QueryCondition[];
  fieldUpdates: Record<string, any>;
}

export async function bulkUpdateRecords(
  pool: Pool,
  userId: string,
  request: BulkUpdateRequest,
  token?: string
): Promise<{ updatedCount: number }> {
  await validateUserBaseAccess(pool, userId, request.baseId);
  const fields = await getTableSchema(pool, request.tableId);
  const validDbFieldNames = new Set(fields.map(f => f.dbFieldName));

  const sanitizedUpdates: Record<string, any> = {};
  for (const [key, value] of Object.entries(request.fieldUpdates)) {
    if (validDbFieldNames.has(key)) sanitizedUpdates[key] = value;
  }
  if (Object.keys(sanitizedUpdates).length === 0) throw new Error('No valid fields provided for update');

  const result = await backendPost('/api/record/update_records_by_filters', {
    baseId: request.baseId,
    tableId: request.tableId,
    conditions: request.conditions,
    fieldUpdates: sanitizedUpdates,
  }, token);

  return { updatedCount: result?.updatedCount || 0 };
}

export interface BulkDeleteRequest {
  baseId: string;
  tableId: string;
  conditions: QueryCondition[];
}

export async function bulkDeleteRecords(
  pool: Pool,
  userId: string,
  request: BulkDeleteRequest,
  token?: string
): Promise<{ deletedCount: number }> {
  await validateUserBaseAccess(pool, userId, request.baseId);

  // First query matching record IDs (read-only), then delete via backend
  const tableResult = await pool.query(
    `SELECT db_table_name, base_id FROM table_meta WHERE id = $1 AND status = 'active'`,
    [request.tableId]
  );
  if (tableResult.rows.length === 0) throw new Error(`Table ${request.tableId} not found`);
  if (tableResult.rows[0].base_id !== request.baseId) throw new Error('Security violation: baseId mismatch');

  const dbTableName = tableResult.rows[0].db_table_name;
  const fields = await getTableSchema(pool, request.tableId);
  const validDbFieldNames = new Set(fields.map(f => f.dbFieldName));

  // Build WHERE clause to find matching records (read-only SELECT)
  const params: any[] = [];
  const whereParts: string[] = [];
  for (const cond of (request.conditions || [])) {
    if (!validDbFieldNames.has(cond.fieldDbName)) continue;
    const paramIndex = params.length + 1;
    const quotedField = `"${cond.fieldDbName}"`;
    switch (cond.operator) {
      case 'equals': case '=':
        whereParts.push(`${quotedField} = $${paramIndex}`); params.push(cond.value); break;
      case 'not_equals': case '!=':
        whereParts.push(`${quotedField} != $${paramIndex}`); params.push(cond.value); break;
      case 'contains':
        whereParts.push(`${quotedField}::text ILIKE $${paramIndex}`); params.push(`%${cond.value}%`); break;
      case 'not_contains':
        whereParts.push(`${quotedField}::text NOT ILIKE $${paramIndex}`); params.push(`%${cond.value}%`); break;
      case 'greater_than': case '>':
        whereParts.push(`${quotedField} > $${paramIndex}`); params.push(cond.value); break;
      case 'less_than': case '<':
        whereParts.push(`${quotedField} < $${paramIndex}`); params.push(cond.value); break;
      case 'greater_or_equal': case '>=':
        whereParts.push(`${quotedField} >= $${paramIndex}`); params.push(cond.value); break;
      case 'less_or_equal': case '<=':
        whereParts.push(`${quotedField} <= $${paramIndex}`); params.push(cond.value); break;
      case 'is_empty':
        whereParts.push(`(${quotedField} IS NULL OR ${quotedField}::text = '')`); break;
      case 'is_not_empty':
        whereParts.push(`(${quotedField} IS NOT NULL AND ${quotedField}::text != '')`); break;
      default:
        whereParts.push(`${quotedField} = $${paramIndex}`); params.push(cond.value); break;
    }
  }

  if (whereParts.length === 0) throw new Error('At least one filter condition is required for bulk deletes');

  // Read-only: just get the IDs
  const selectQuery = `SELECT __id FROM ${quoteTableName(dbTableName)} WHERE ${whereParts.join(' AND ')} LIMIT 10000`;
  const matchResult = await pool.query(selectQuery, params);
  const recordIds = matchResult.rows.map((r: any) => r.__id);

  if (recordIds.length === 0) return { deletedCount: 0 };

  // Delete via backend
  await backendPost('/api/record/update_records_status', {
    baseId: request.baseId,
    tableId: request.tableId,
    recordIds,
    status: 'deleted',
  }, token);

  return { deletedCount: recordIds.length };
}

export async function createTableWithSchema(
  baseId: string,
  userId: string,
  tableName: string,
  fields: { name: string; type: string; options?: any }[],
  records?: Record<string, any>[],
  backendUrl?: string,
): Promise<{ tableId: string; viewId: string; fieldCount: number; recordCount: number }> {
  const axios = require('axios');
  const url = backendUrl || process.env.BACKEND_URL || 'http://localhost:3000';

  // Step 1: Create table with fields via the existing AI enrichment table endpoint
  const createResponse = await axios.post(
    `${url}/api/table/create-ai-enrichment-table`,
    {
      table_name: tableName,
      baseId,
      user_id: userId,
      fields_payload: fields.map((f) => ({
        name: f.name,
        type: f.type,
        options: f.options || undefined,
      })),
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    },
  );

  const { table, view, fields: createdFields } = createResponse.data;

  let recordCount = 0;

  // Step 2: Insert sample records if provided
  if (records && records.length > 0 && createdFields && createdFields.length > 0) {
    // Map field names to dbFieldNames
    const fieldNameToDb: Record<string, string> = {};
    for (const cf of createdFields) {
      fieldNameToDb[cf.name] = cf.dbFieldName;
    }

    // Transform records to use dbFieldNames
    const dbRecords = records.map((record) => {
      const dbRecord: Record<string, any> = {};
      for (const [key, value] of Object.entries(record)) {
        const dbName = fieldNameToDb[key];
        if (dbName) {
          dbRecord[dbName] = value;
        }
      }
      return dbRecord;
    });

    const columns = createdFields.map((f: any) => f.dbFieldName);

    try {
      await axios.post(
        `${url}/api/record/v1/create_multiple_records`,
        {
          records: dbRecords,
          columns,
          baseId,
          tableId: table.id,
          viewId: view.id,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        },
      );
      recordCount = records.length;
    } catch (err: any) {
      console.error('Failed to insert sample records:', err.message);
      // Table was still created, just without records
    }
  }

  return {
    tableId: table.id,
    viewId: view.id,
    fieldCount: createdFields?.length || fields.length,
    recordCount,
  };
}
