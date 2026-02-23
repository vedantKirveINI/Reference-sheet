import { Pool } from 'pg';

export interface FieldSchema {
  id: number;
  name: string;
  type: string;
  dbFieldName: string;
  dbFieldType: string;
  isPrimary: boolean;
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
    `SELECT id, name, type, "dbFieldName", "dbFieldType", "isPrimary", options
     FROM field
     WHERE "tableMetaId" = $1 AND status = 'active'
     ORDER BY "order" ASC`,
    [tableId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    dbFieldName: row.dbFieldName,
    dbFieldType: row.dbFieldType,
    isPrimary: row.isPrimary,
    options: row.options,
  }));
}

export async function queryTableData(
  pool: Pool,
  baseId: string,
  tableId: string,
  conditions: QueryCondition[] = [],
  limit: number = 100,
  orderBy?: OrderByClause[]
): Promise<{ fields: FieldSchema[]; records: Record<string, any>[] }> {
  const tableResult = await pool.query(
    `SELECT "dbTableName", "baseId" FROM table_meta WHERE id = $1 AND status = 'active'`,
    [tableId]
  );

  if (tableResult.rows.length === 0) {
    throw new Error(`Table ${tableId} not found`);
  }

  const tableMeta = tableResult.rows[0];

  if (tableMeta.baseId !== baseId) {
    throw new Error('Security violation: baseId does not match the table\'s baseId');
  }

  const dbTableName = tableMeta.dbTableName;
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

  const query = `SELECT * FROM "${dbTableName}"${whereClause}${orderClause} LIMIT $${limitParamIndex}`;

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
      `SELECT id, name FROM table_meta WHERE "baseId" = $1 AND status = 'active' ORDER BY "order" ASC`,
      [base.id]
    );

    const tables = [];
    for (const table of tablesResult.rows) {
      const fieldsResult = await pool.query(
        `SELECT id, name, type, "dbFieldName" FROM field WHERE "tableMetaId" = $1 AND status = 'active' ORDER BY "order" ASC`,
        [table.id]
      );
      tables.push({
        id: table.id,
        name: table.name,
        fields: fieldsResult.rows.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          dbFieldName: f.dbFieldName,
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

export async function createRecord(
  pool: Pool,
  baseId: string,
  tableId: string,
  fieldValues: Record<string, any>
): Promise<{ id: string }> {
  const tableResult = await pool.query(
    `SELECT "dbTableName", "baseId" FROM table_meta WHERE id = $1 AND status = 'active'`,
    [tableId]
  );
  if (tableResult.rows.length === 0) throw new Error(`Table ${tableId} not found`);
  if (tableResult.rows[0].baseId !== baseId) throw new Error('Security violation: baseId mismatch');

  const dbTableName = tableResult.rows[0].dbTableName;
  const fields = await getTableSchema(pool, tableId);
  const validDbFieldNames = new Set(fields.map(f => f.dbFieldName));

  const columns: string[] = [];
  const values: any[] = [];
  const placeholders: string[] = [];

  for (const [key, value] of Object.entries(fieldValues)) {
    if (validDbFieldNames.has(key)) {
      columns.push(`"${key}"`);
      values.push(value);
      placeholders.push(`$${values.length}`);
    }
  }

  if (columns.length === 0) throw new Error('No valid fields provided');

  const result = await pool.query(
    `INSERT INTO "${dbTableName}" (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING __id`,
    values
  );

  return { id: result.rows[0].__id };
}

export async function updateRecord(
  pool: Pool,
  baseId: string,
  tableId: string,
  recordId: string,
  fieldValues: Record<string, any>
): Promise<void> {
  const tableResult = await pool.query(
    `SELECT "dbTableName", "baseId" FROM table_meta WHERE id = $1 AND status = 'active'`,
    [tableId]
  );
  if (tableResult.rows.length === 0) throw new Error(`Table ${tableId} not found`);
  if (tableResult.rows[0].baseId !== baseId) throw new Error('Security violation: baseId mismatch');

  const dbTableName = tableResult.rows[0].dbTableName;
  const fields = await getTableSchema(pool, tableId);
  const validDbFieldNames = new Set(fields.map(f => f.dbFieldName));

  const setClauses: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(fieldValues)) {
    if (validDbFieldNames.has(key)) {
      values.push(value);
      setClauses.push(`"${key}" = $${values.length}`);
    }
  }

  if (setClauses.length === 0) throw new Error('No valid fields provided');

  values.push(recordId);
  await pool.query(
    `UPDATE "${dbTableName}" SET ${setClauses.join(', ')} WHERE __id = $${values.length}`,
    values
  );
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
  request: SummarizeRequest
): Promise<{ results: Record<string, any>[]; summary: string }> {
  const tableResult = await pool.query(
    `SELECT "dbTableName", "baseId" FROM table_meta WHERE id = $1 AND status = 'active'`,
    [request.tableId]
  );
  if (tableResult.rows.length === 0) throw new Error(`Table ${request.tableId} not found`);
  if (tableResult.rows[0].baseId !== request.baseId) throw new Error('Security violation: baseId mismatch');

  const dbTableName = tableResult.rows[0].dbTableName;
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

  const query = `SELECT ${selectParts.join(', ')} FROM "${dbTableName}"${whereClause}${groupByClause} ORDER BY result DESC LIMIT 1000`;

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
  baseId: string,
  tableId: string,
  recordId: string
): Promise<void> {
  const tableResult = await pool.query(
    `SELECT "dbTableName", "baseId" FROM table_meta WHERE id = $1 AND status = 'active'`,
    [tableId]
  );
  if (tableResult.rows.length === 0) throw new Error(`Table ${tableId} not found`);
  if (tableResult.rows[0].baseId !== baseId) throw new Error('Security violation: baseId mismatch');

  const dbTableName = tableResult.rows[0].dbTableName;
  await pool.query(`DELETE FROM "${dbTableName}" WHERE __id = $1`, [recordId]);
}

export interface BulkUpdateRequest {
  baseId: string;
  tableId: string;
  conditions: QueryCondition[];
  fieldUpdates: Record<string, any>;
}

export async function bulkUpdateRecords(
  pool: Pool,
  request: BulkUpdateRequest
): Promise<{ updatedCount: number }> {
  const tableResult = await pool.query(
    `SELECT "dbTableName", "baseId" FROM table_meta WHERE id = $1 AND status = 'active'`,
    [request.tableId]
  );
  if (tableResult.rows.length === 0) throw new Error(`Table ${request.tableId} not found`);
  if (tableResult.rows[0].baseId !== request.baseId) throw new Error('Security violation: baseId mismatch');

  const dbTableName = tableResult.rows[0].dbTableName;
  if (!dbTableName) throw new Error(`Table ${request.tableId} has no physical table name`);

  const fields = await getTableSchema(pool, request.tableId);
  const validDbFieldNames = new Set(fields.map(f => f.dbFieldName));

  const setClauses: string[] = [];
  const params: any[] = [];

  for (const [key, value] of Object.entries(request.fieldUpdates)) {
    if (validDbFieldNames.has(key)) {
      params.push(value);
      setClauses.push(`"${key}" = $${params.length}`);
    }
  }

  if (setClauses.length === 0) throw new Error('No valid fields provided for update');

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

  if (!whereClause) throw new Error('At least one filter condition is required for bulk updates to prevent accidental full-table updates');

  const query = `UPDATE "${dbTableName}" SET ${setClauses.join(', ')}${whereClause}`;
  const result = await pool.query(query, params);

  return { updatedCount: result.rowCount || 0 };
}

export interface BulkDeleteRequest {
  baseId: string;
  tableId: string;
  conditions: QueryCondition[];
}

export async function bulkDeleteRecords(
  pool: Pool,
  request: BulkDeleteRequest
): Promise<{ deletedCount: number }> {
  const tableResult = await pool.query(
    `SELECT "dbTableName", "baseId" FROM table_meta WHERE id = $1 AND status = 'active'`,
    [request.tableId]
  );
  if (tableResult.rows.length === 0) throw new Error(`Table ${request.tableId} not found`);
  if (tableResult.rows[0].baseId !== request.baseId) throw new Error('Security violation: baseId mismatch');

  const dbTableName = tableResult.rows[0].dbTableName;
  if (!dbTableName) throw new Error(`Table ${request.tableId} has no physical table name`);

  const fields = await getTableSchema(pool, request.tableId);
  const validDbFieldNames = new Set(fields.map(f => f.dbFieldName));

  const params: any[] = [];
  const whereParts: string[] = [];

  if (request.conditions && request.conditions.length > 0) {
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
  }

  if (whereParts.length === 0) throw new Error('At least one filter condition is required for bulk deletes to prevent accidental full-table deletes');

  const whereClause = ' WHERE ' + whereParts.join(' AND ');
  const query = `DELETE FROM "${dbTableName}"${whereClause}`;
  const result = await pool.query(query, params);

  return { deletedCount: result.rowCount || 0 };
}
