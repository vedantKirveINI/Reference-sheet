export function createFieldFixture(overrides: Partial<any> = {}) {
  return {
    id: overrides.id ?? 'field-1',
    tableId: overrides.tableId ?? 'table-1',
    name: overrides.name ?? 'Test Field',
    type: overrides.type ?? 'SHORT_TEXT',
    dbFieldName: overrides.dbFieldName ?? 'field_1',
    dbFieldType: overrides.dbFieldType ?? 'TEXT',
    options: overrides.options ?? '{}',
    isPrimary: overrides.isPrimary ?? false,
    isComputed: overrides.isComputed ?? false,
    order: overrides.order ?? 1,
    fieldFormat: overrides.fieldFormat ?? null,
    createdTime: overrides.createdTime ?? new Date('2025-01-01'),
    ...overrides,
  };
}

export function createTableFixture(overrides: Partial<any> = {}) {
  return {
    id: overrides.id ?? 'table-1',
    baseId: overrides.baseId ?? 'base-1',
    name: overrides.name ?? 'Test Table',
    dbTableName: overrides.dbTableName ?? 'tbl_test_123',
    order: overrides.order ?? 1,
    createdTime: overrides.createdTime ?? new Date('2025-01-01'),
    ...overrides,
  };
}

export function createViewFixture(overrides: Partial<any> = {}) {
  return {
    id: overrides.id ?? 'view-1',
    tableId: overrides.tableId ?? 'table-1',
    name: overrides.name ?? 'Grid View',
    type: overrides.type ?? 'grid',
    filter: overrides.filter ?? null,
    sort: overrides.sort ?? null,
    group: overrides.group ?? null,
    columnMeta: overrides.columnMeta ?? '[]',
    options: overrides.options ?? '{}',
    order: overrides.order ?? 1,
    ...overrides,
  };
}

export function createBaseFixture(overrides: Partial<any> = {}) {
  return {
    id: overrides.id ?? 'base-1',
    spaceId: overrides.spaceId ?? 'space-1',
    name: overrides.name ?? 'Test Base',
    order: overrides.order ?? 1,
    icon: overrides.icon ?? null,
    createdTime: overrides.createdTime ?? new Date('2025-01-01'),
    createdBy: overrides.createdBy ?? 'user-1',
    ...overrides,
  };
}

export function createSpaceFixture(overrides: Partial<any> = {}) {
  return {
    id: overrides.id ?? 'space-1',
    name: overrides.name ?? 'Test Space',
    createdTime: overrides.createdTime ?? new Date('2025-01-01'),
    createdBy: overrides.createdBy ?? 'user-1',
    ...overrides,
  };
}

export function createCommentFixture(overrides: Partial<any> = {}) {
  return {
    id: overrides.id ?? 'comment-1',
    content: overrides.content ?? 'Test comment content',
    recordId: overrides.recordId ?? 'rec-1',
    tableId: overrides.tableId ?? 'table-1',
    userId: overrides.userId ?? 'user-1',
    createdAt: overrides.createdAt ?? new Date('2025-01-01'),
    ...overrides,
  };
}

export function createRecordFixture(overrides: Partial<any> = {}) {
  return {
    __id: overrides.__id ?? 'rec-1',
    __auto_number: overrides.__auto_number ?? 1,
    __created_time: overrides.__created_time ?? new Date('2025-01-01'),
    __created_by: overrides.__created_by ?? 'user-1',
    __last_modified_time: overrides.__last_modified_time ?? new Date('2025-01-01'),
    __last_modified_by: overrides.__last_modified_by ?? 'user-1',
    ...overrides,
  };
}

export function createEnrichmentFieldFixture(overrides: Partial<any> = {}) {
  return {
    tableId: overrides.tableId ?? 'table-1',
    viewId: overrides.viewId ?? 'view-1',
    name: overrides.name ?? 'Company Enrichment',
    entityType: overrides.entityType ?? 'COMPANY',
    identifierFieldId: overrides.identifierFieldId ?? 'field-1',
    fieldsToEnrich: overrides.fieldsToEnrich ?? [
      { name: 'Industry', outputKey: 'industry' },
      { name: 'Size', outputKey: 'size' },
    ],
    autoUpdate: overrides.autoUpdate ?? false,
    ...overrides,
  };
}

export const ALL_QUESTION_TYPES = [
  'SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'EMAIL', 'PHONE_NUMBER',
  'CURRENCY', 'CHECKBOX', 'SCQ', 'MCQ', 'DATE', 'TIME',
  'RATING', 'SLIDER', 'OPINION_SCALE', 'YES_NO', 'ZIP_CODE',
  'ADDRESS', 'DROP_DOWN', 'LIST', 'RANKING', 'SIGNATURE',
  'CREATED_TIME', 'CREATED_BY', 'LAST_MODIFIED_TIME',
  'LAST_MODIFIED_BY', 'AUTO_NUMBER', 'BUTTON', 'FORMULA',
  'LINK', 'LOOKUP', 'ROLLUP', 'ENRICHMENT',
] as const;
