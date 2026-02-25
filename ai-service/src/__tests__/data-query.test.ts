import {
  getTableSchema,
  queryTableData,
  getAllAccessibleBases,
  createRecord,
  updateRecord,
  deleteRecord,
  summarizeTableData,
  bulkUpdateRecords,
  bulkDeleteRecords,
} from '../data-query';

function createMockPool(queryResults: Record<string, any> = {}) {
  const callIndex = { current: 0 };
  const calls: { text: string; params: any[] }[] = [];
  const resultQueue: any[] = [];

  const pool = {
    query: jest.fn(async (text: string, params?: any[]) => {
      calls.push({ text, params: params || [] });

      if (queryResults[text]) {
        return typeof queryResults[text] === 'function'
          ? queryResults[text](params)
          : queryResults[text];
      }

      if (resultQueue.length > 0) {
        return resultQueue.shift();
      }

      return { rows: [], rowCount: 0 };
    }),
    _calls: calls,
    _enqueue: (result: any) => resultQueue.push(result),
  };

  return pool as any;
}

const sampleFields = [
  { id: 1, name: 'Name', type: 'SHORT_TEXT', dbFieldName: 'fld_name', dbFieldType: 'text', isPrimary: true, options: null },
  { id: 2, name: 'Status', type: 'SCQ', dbFieldName: 'fld_status', dbFieldType: 'text', isPrimary: false, options: null },
  { id: 3, name: 'Budget', type: 'NUMBER', dbFieldName: 'fld_budget', dbFieldType: 'numeric', isPrimary: false, options: null },
];

describe('getTableSchema', () => {
  it('returns mapped field schema from query results', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: sampleFields });

    const result = await getTableSchema(pool, 'tbl1');

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: 1, name: 'Name', type: 'SHORT_TEXT', dbFieldName: 'fld_name',
      dbFieldType: 'text', isPrimary: true, options: null,
    });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM field'),
      ['tbl1']
    );
  });

  it('returns empty array when no fields exist', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [] });
    const result = await getTableSchema(pool, 'tbl_empty');
    expect(result).toEqual([]);
  });
});

describe('queryTableData', () => {
  function setupQueryPool(tableMeta = { dbTableName: 'visual_tbl1', baseId: 'base1' }) {
    const pool = createMockPool();
    pool._enqueue({ rows: [tableMeta] });
    pool._enqueue({ rows: sampleFields });
    pool._enqueue({ rows: [{ __id: 'rec1', fld_name: 'Project A', fld_status: 'Active', fld_budget: 10000 }] });
    return pool;
  }

  it('queries table data and maps field names', async () => {
    const pool = setupQueryPool();
    const result = await queryTableData(pool, 'base1', 'tbl1');

    expect(result.fields).toHaveLength(3);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]['Name']).toBe('Project A');
    expect(result.records[0]['Status']).toBe('Active');
  });

  it('throws if table not found', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [] });
    await expect(queryTableData(pool, 'base1', 'tbl_missing')).rejects.toThrow('not found');
  });

  it('throws if baseId does not match', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'other_base' }] });
    await expect(queryTableData(pool, 'base1', 'tbl1')).rejects.toThrow('Security violation');
  });

  it('throws if table has no physical table name', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: null, baseId: 'base1' }] });
    await expect(queryTableData(pool, 'base1', 'tbl1')).rejects.toThrow('no physical table name');
  });

  it('applies equals conditions', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [
      { fieldDbName: 'fld_status', operator: 'equals', value: 'Active' },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).toContain('WHERE');
    expect(lastCall[0]).toContain('"fld_status" =');
    expect(lastCall[1]).toContain('Active');
  });

  it('applies not_equals conditions', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [
      { fieldDbName: 'fld_status', operator: 'not_equals', value: 'Done' },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).toContain('"fld_status" !=');
  });

  it('applies contains conditions with ILIKE', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [
      { fieldDbName: 'fld_name', operator: 'contains', value: 'proj' },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).toContain('ILIKE');
    expect(lastCall[1]).toContain('%proj%');
  });

  it('applies not_contains conditions', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [
      { fieldDbName: 'fld_name', operator: 'not_contains', value: 'x' },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).toContain('NOT ILIKE');
  });

  it('applies greater_than and less_than', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [
      { fieldDbName: 'fld_budget', operator: 'greater_than', value: 5000 },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).toContain('"fld_budget" >');
  });

  it('applies is_empty condition without value param', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [
      { fieldDbName: 'fld_status', operator: 'is_empty', value: null },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).toContain('IS NULL');
  });

  it('applies is_not_empty condition', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [
      { fieldDbName: 'fld_status', operator: 'is_not_empty', value: null },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).toContain('IS NOT NULL');
  });

  it('skips invalid field names in conditions', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [
      { fieldDbName: 'nonexistent', operator: 'equals', value: 'x' },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).not.toContain('WHERE');
  });

  it('applies orderBy clause', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [], 100, [
      { fieldDbName: 'fld_budget', order: 'desc' },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).toContain('ORDER BY');
    expect(lastCall[0]).toContain('"fld_budget" DESC');
  });

  it('clamps limit between 1 and 1000', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [], 5000);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[1]).toContain(1000);
  });

  it('applies default operator (equals) for unknown operators', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [
      { fieldDbName: 'fld_status', operator: 'unknown_op', value: 'test' },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).toContain('"fld_status" =');
  });

  it('applies alias operators (=, !=, >, <, >=, <=)', async () => {
    const pool = setupQueryPool();
    await queryTableData(pool, 'base1', 'tbl1', [
      { fieldDbName: 'fld_budget', operator: '>=', value: 100 },
    ]);
    const lastCall = pool.query.mock.calls[pool.query.mock.calls.length - 1];
    expect(lastCall[0]).toContain('"fld_budget" >=');
  });

  it('preserves unmapped keys in records', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'base1' }] });
    pool._enqueue({ rows: sampleFields });
    pool._enqueue({ rows: [{ __id: 'rec1', fld_name: 'A', unknown_col: 'extra' }] });
    const result = await queryTableData(pool, 'base1', 'tbl1');
    expect(result.records[0]['__id']).toBe('rec1');
    expect(result.records[0]['unknown_col']).toBe('extra');
  });
});

describe('getAllAccessibleBases', () => {
  it('returns bases with their tables and fields', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ id: 'base1', name: 'Base One' }] });
    pool._enqueue({ rows: [{ id: 'tbl1', name: 'Table One' }] });
    pool._enqueue({ rows: [{ id: 1, name: 'Name', type: 'SHORT_TEXT', dbFieldName: 'fld_name' }] });

    const result = await getAllAccessibleBases(pool);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('base1');
    expect(result[0].tables).toHaveLength(1);
    expect(result[0].tables[0].fields).toHaveLength(1);
  });

  it('returns empty array when no bases exist', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [] });
    const result = await getAllAccessibleBases(pool);
    expect(result).toEqual([]);
  });

  it('handles multiple bases with multiple tables', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ id: 'b1', name: 'B1' }, { id: 'b2', name: 'B2' }] });
    pool._enqueue({ rows: [{ id: 't1', name: 'T1' }, { id: 't2', name: 'T2' }] });
    pool._enqueue({ rows: [{ id: 1, name: 'F1', type: 'TEXT', dbFieldName: 'f1' }] });
    pool._enqueue({ rows: [{ id: 2, name: 'F2', type: 'TEXT', dbFieldName: 'f2' }] });
    pool._enqueue({ rows: [{ id: 't3', name: 'T3' }] });
    pool._enqueue({ rows: [{ id: 3, name: 'F3', type: 'NUMBER', dbFieldName: 'f3' }] });

    const result = await getAllAccessibleBases(pool);
    expect(result).toHaveLength(2);
    expect(result[0].tables).toHaveLength(2);
    expect(result[1].tables).toHaveLength(1);
  });
});

describe('createRecord', () => {
  function setupCreatePool() {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'base1' }] });
    pool._enqueue({ rows: sampleFields });
    pool._enqueue({ rows: [{ __id: 'new_rec_1' }] });
    return pool;
  }

  it('creates a record and returns its id', async () => {
    const pool = setupCreatePool();
    const result = await createRecord(pool, 'base1', 'tbl1', { fld_name: 'Test', fld_status: 'Active' });
    expect(result.id).toBe('new_rec_1');
    const insertCall = pool.query.mock.calls[2];
    expect(insertCall[0]).toContain('INSERT INTO');
    expect(insertCall[0]).toContain('"fld_name"');
  });

  it('throws if table not found', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [] });
    await expect(createRecord(pool, 'base1', 'tbl_x', { fld_name: 'x' })).rejects.toThrow('not found');
  });

  it('throws if baseId mismatch', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'other' }] });
    await expect(createRecord(pool, 'base1', 'tbl1', { fld_name: 'x' })).rejects.toThrow('Security violation');
  });

  it('throws if no valid fields provided', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'base1' }] });
    pool._enqueue({ rows: sampleFields });
    await expect(createRecord(pool, 'base1', 'tbl1', { invalid_field: 'x' })).rejects.toThrow('No valid fields');
  });

  it('ignores invalid field names', async () => {
    const pool = setupCreatePool();
    await createRecord(pool, 'base1', 'tbl1', { fld_name: 'Test', bad_field: 'ignored' });
    const insertCall = pool.query.mock.calls[2];
    expect(insertCall[0]).not.toContain('bad_field');
  });
});

describe('updateRecord', () => {
  function setupUpdatePool() {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'base1' }] });
    pool._enqueue({ rows: sampleFields });
    pool._enqueue({ rows: [], rowCount: 1 });
    return pool;
  }

  it('updates a record with valid fields', async () => {
    const pool = setupUpdatePool();
    await updateRecord(pool, 'base1', 'tbl1', 'rec1', { fld_status: 'Done' });
    const updateCall = pool.query.mock.calls[2];
    expect(updateCall[0]).toContain('UPDATE');
    expect(updateCall[0]).toContain('"fld_status" =');
    expect(updateCall[1]).toContain('Done');
    expect(updateCall[1]).toContain('rec1');
  });

  it('throws if table not found', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [] });
    await expect(updateRecord(pool, 'base1', 'tbl_x', 'rec1', { fld_name: 'x' })).rejects.toThrow('not found');
  });

  it('throws if no valid fields provided', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'base1' }] });
    pool._enqueue({ rows: sampleFields });
    await expect(updateRecord(pool, 'base1', 'tbl1', 'rec1', { bad: 'x' })).rejects.toThrow('No valid fields');
  });
});

describe('deleteRecord', () => {
  it('deletes a record by id', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'base1' }] });
    pool._enqueue({ rows: [], rowCount: 1 });
    await deleteRecord(pool, 'base1', 'tbl1', 'rec1');
    const deleteCall = pool.query.mock.calls[1];
    expect(deleteCall[0]).toContain('DELETE FROM');
    expect(deleteCall[0]).toContain('__id');
    expect(deleteCall[1]).toContain('rec1');
  });

  it('throws if table not found', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [] });
    await expect(deleteRecord(pool, 'base1', 'tbl_x', 'rec1')).rejects.toThrow('not found');
  });

  it('throws on baseId mismatch', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'other' }] });
    await expect(deleteRecord(pool, 'base1', 'tbl1', 'rec1')).rejects.toThrow('Security violation');
  });
});

describe('summarizeTableData', () => {
  function setupSummarizePool(aggResult: any = { rows: [{ result: 42 }] }) {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'base1' }] });
    pool._enqueue({ rows: sampleFields });
    pool._enqueue(aggResult);
    return pool;
  }

  it('performs COUNT aggregation', async () => {
    const pool = setupSummarizePool();
    const result = await summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'count',
    });
    expect(result.summary).toContain('COUNT');
    expect(result.results).toHaveLength(1);
    const lastCall = pool.query.mock.calls[2];
    expect(lastCall[0]).toContain('COUNT(*)');
  });

  it('performs SUM aggregation on a field', async () => {
    const pool = setupSummarizePool();
    const result = await summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'sum', fieldDbName: 'fld_budget',
    });
    expect(result.summary).toContain('SUM');
    const lastCall = pool.query.mock.calls[2];
    expect(lastCall[0]).toContain('SUM("fld_budget"::numeric)');
  });

  it('performs AVG aggregation', async () => {
    const pool = setupSummarizePool();
    await summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'avg', fieldDbName: 'fld_budget',
    });
    const lastCall = pool.query.mock.calls[2];
    expect(lastCall[0]).toContain('AVG("fld_budget"::numeric)');
  });

  it('performs MIN aggregation', async () => {
    const pool = setupSummarizePool();
    await summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'min', fieldDbName: 'fld_budget',
    });
    const lastCall = pool.query.mock.calls[2];
    expect(lastCall[0]).toContain('MIN("fld_budget")');
  });

  it('performs MAX aggregation', async () => {
    const pool = setupSummarizePool();
    await summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'max', fieldDbName: 'fld_budget',
    });
    const lastCall = pool.query.mock.calls[2];
    expect(lastCall[0]).toContain('MAX("fld_budget")');
  });

  it('performs COUNT_DISTINCT aggregation', async () => {
    const pool = setupSummarizePool();
    await summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'count_distinct', fieldDbName: 'fld_status',
    });
    const lastCall = pool.query.mock.calls[2];
    expect(lastCall[0]).toContain('COUNT(DISTINCT "fld_status")');
  });

  it('throws for unknown aggregation', async () => {
    const pool = setupSummarizePool();
    await expect(summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'median' as any, fieldDbName: 'fld_budget',
    })).rejects.toThrow('Unknown aggregation');
  });

  it('throws when fieldDbName is required but missing', async () => {
    const pool = setupSummarizePool();
    await expect(summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'sum',
    })).rejects.toThrow('fieldDbName is required');
  });

  it('throws for invalid field name', async () => {
    const pool = setupSummarizePool();
    await expect(summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'sum', fieldDbName: 'nonexistent',
    })).rejects.toThrow('Invalid field');
  });

  it('applies group by fields', async () => {
    const pool = setupSummarizePool({
      rows: [
        { fld_status: 'Active', result: 5 },
        { fld_status: 'Done', result: 3 },
      ],
    });
    const result = await summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'count',
      groupByFields: ['fld_status'],
    });
    const lastCall = pool.query.mock.calls[2];
    expect(lastCall[0]).toContain('GROUP BY');
    expect(result.summary).toContain('grouped by');
    expect(result.results).toHaveLength(2);
  });

  it('applies conditions to summarize query', async () => {
    const pool = setupSummarizePool();
    await summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'count',
      conditions: [{ fieldDbName: 'fld_status', operator: 'equals', value: 'Active' }],
    });
    const lastCall = pool.query.mock.calls[2];
    expect(lastCall[0]).toContain('WHERE');
    expect(lastCall[1]).toContain('Active');
  });

  it('maps field names in grouped results', async () => {
    const pool = setupSummarizePool({
      rows: [{ fld_status: 'Active', result: 5 }],
    });
    const result = await summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'count',
      groupByFields: ['fld_status'],
    });
    expect(result.results[0]['Status']).toBe('Active');
  });

  it('generates "no results" summary when empty', async () => {
    const pool = setupSummarizePool({ rows: [] });
    const result = await summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'count',
    });
    expect(result.summary).toContain('no results');
  });

  it('throws on baseId mismatch', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'other' }] });
    await expect(summarizeTableData(pool, {
      baseId: 'base1', tableId: 'tbl1', aggregation: 'count',
    })).rejects.toThrow('Security violation');
  });
});

describe('bulkUpdateRecords', () => {
  function setupBulkUpdatePool() {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'base1' }] });
    pool._enqueue({ rows: sampleFields });
    pool._enqueue({ rows: [], rowCount: 5 });
    return pool;
  }

  it('updates records matching conditions', async () => {
    const pool = setupBulkUpdatePool();
    const result = await bulkUpdateRecords(pool, {
      baseId: 'base1', tableId: 'tbl1',
      conditions: [{ fieldDbName: 'fld_status', operator: 'equals', value: 'Active' }],
      fieldUpdates: { fld_status: 'Done' },
    });
    expect(result.updatedCount).toBe(5);
    const updateCall = pool.query.mock.calls[2];
    expect(updateCall[0]).toContain('UPDATE');
    expect(updateCall[0]).toContain('WHERE');
  });

  it('throws without conditions (safety)', async () => {
    const pool = setupBulkUpdatePool();
    await expect(bulkUpdateRecords(pool, {
      baseId: 'base1', tableId: 'tbl1',
      conditions: [],
      fieldUpdates: { fld_status: 'Done' },
    })).rejects.toThrow('At least one filter condition');
  });

  it('throws when no valid update fields provided', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'base1' }] });
    pool._enqueue({ rows: sampleFields });
    await expect(bulkUpdateRecords(pool, {
      baseId: 'base1', tableId: 'tbl1',
      conditions: [{ fieldDbName: 'fld_status', operator: 'equals', value: 'x' }],
      fieldUpdates: { invalid_field: 'x' },
    })).rejects.toThrow('No valid fields');
  });

  it('throws on baseId mismatch', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'other' }] });
    await expect(bulkUpdateRecords(pool, {
      baseId: 'base1', tableId: 'tbl1',
      conditions: [{ fieldDbName: 'fld_status', operator: 'equals', value: 'x' }],
      fieldUpdates: { fld_status: 'Done' },
    })).rejects.toThrow('Security violation');
  });
});

describe('bulkDeleteRecords', () => {
  function setupBulkDeletePool() {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'base1' }] });
    pool._enqueue({ rows: sampleFields });
    pool._enqueue({ rows: [], rowCount: 3 });
    return pool;
  }

  it('deletes records matching conditions', async () => {
    const pool = setupBulkDeletePool();
    const result = await bulkDeleteRecords(pool, {
      baseId: 'base1', tableId: 'tbl1',
      conditions: [{ fieldDbName: 'fld_status', operator: 'equals', value: 'Archived' }],
    });
    expect(result.deletedCount).toBe(3);
    const deleteCall = pool.query.mock.calls[2];
    expect(deleteCall[0]).toContain('DELETE FROM');
    expect(deleteCall[0]).toContain('WHERE');
  });

  it('throws without conditions (safety)', async () => {
    const pool = setupBulkDeletePool();
    await expect(bulkDeleteRecords(pool, {
      baseId: 'base1', tableId: 'tbl1',
      conditions: [],
    })).rejects.toThrow('At least one filter condition');
  });

  it('throws on baseId mismatch', async () => {
    const pool = createMockPool();
    pool._enqueue({ rows: [{ dbTableName: 'visual_tbl1', baseId: 'other' }] });
    await expect(bulkDeleteRecords(pool, {
      baseId: 'base1', tableId: 'tbl1',
      conditions: [{ fieldDbName: 'fld_status', operator: 'equals', value: 'x' }],
    })).rejects.toThrow('Security violation');
  });
});
