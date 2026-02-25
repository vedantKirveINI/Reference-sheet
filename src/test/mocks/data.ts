import { vi } from 'vitest';

export function createMockColumn(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'col-1',
    name: overrides.name ?? 'Test Column',
    type: overrides.type ?? 'SHORT_TEXT',
    rawId: overrides.rawId ?? 1,
    width: overrides.width ?? 200,
    options: overrides.options ?? [],
    rawOptions: overrides.rawOptions ?? {},
    dbFieldName: overrides.dbFieldName ?? 'field_1',
    isPrimary: overrides.isPrimary ?? false,
    isComputed: overrides.isComputed ?? false,
    fieldFormat: overrides.fieldFormat ?? null,
    ...overrides,
  };
}

export function createMockRecord(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'rec-1',
    cells: overrides.cells ?? { 'col-1': 'Test Value' },
    createdTime: overrides.createdTime ?? '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockView(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'view-1',
    name: overrides.name ?? 'Grid View',
    type: overrides.type ?? 'grid',
    filter: overrides.filter ?? null,
    sort: overrides.sort ?? null,
    group: overrides.group ?? null,
    columnMeta: overrides.columnMeta ?? [],
    ...overrides,
  };
}

export function createMockTable(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'table-1',
    name: overrides.name ?? 'Test Table',
    dbTableName: overrides.dbTableName ?? 'tbl_test',
    order: overrides.order ?? 1,
    ...overrides,
  };
}

export function createMockBase(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'base-1',
    name: overrides.name ?? 'Test Base',
    spaceId: overrides.spaceId ?? 'space-1',
    ...overrides,
  };
}

export function createMockSheet(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'sheet-1',
    name: overrides.name ?? 'Test Sheet',
    tables: overrides.tables ?? [createMockTable()],
    ...overrides,
  };
}

export function createMockComment(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'comment-1',
    content: overrides.content ?? 'Test comment',
    recordId: overrides.recordId ?? 'rec-1',
    userId: overrides.userId ?? 'user-1',
    createdAt: overrides.createdAt ?? '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockEnrichmentConfig(overrides: Record<string, any> = {}) {
  return {
    entityType: overrides.entityType ?? 'COMPANY',
    identifierFieldId: overrides.identifierFieldId ?? 'col-1',
    outputFields: overrides.outputFields ?? ['industry', 'size', 'location'],
    autoUpdate: overrides.autoUpdate ?? false,
    ...overrides,
  };
}

export const ALL_FIELD_TYPES = [
  'SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'EMAIL', 'PHONE_NUMBER',
  'CURRENCY', 'CHECKBOX', 'SCQ', 'MCQ', 'DATE', 'TIME',
  'RATING', 'SLIDER', 'OPINION_SCALE', 'YES_NO', 'ZIP_CODE',
  'ADDRESS', 'DROP_DOWN', 'LIST', 'RANKING', 'SIGNATURE',
  'CREATED_TIME', 'CREATED_BY', 'LAST_MODIFIED_TIME',
  'LAST_MODIFIED_BY', 'AUTO_NUMBER', 'BUTTON', 'FORMULA',
  'LINK', 'LOOKUP', 'ROLLUP', 'ENRICHMENT', 'USER',
] as const;

export function createColumnsForAllTypes() {
  return ALL_FIELD_TYPES.map((type, i) => createMockColumn({
    id: `col-${i}`,
    name: `${type} Field`,
    type,
    rawId: i + 1,
    dbFieldName: `field_${i + 1}`,
  }));
}

export function createMockCurrencyValue(overrides: Record<string, any> = {}) {
  return {
    countryCode: overrides.countryCode ?? 'US',
    currencyCode: overrides.currencyCode ?? 'USD',
    currencySymbol: overrides.currencySymbol ?? '$',
    currencyValue: overrides.currencyValue ?? '100.00',
    ...overrides,
  };
}

export function createMockPhoneValue(overrides: Record<string, any> = {}) {
  return {
    countryCode: overrides.countryCode ?? 'US',
    countryNumber: overrides.countryNumber ?? '1',
    phoneNumber: overrides.phoneNumber ?? '5551234567',
    ...overrides,
  };
}

export function createMockAddressValue(overrides: Record<string, any> = {}) {
  return {
    fullName: overrides.fullName ?? 'John Doe',
    addressLineOne: overrides.addressLineOne ?? '123 Main St',
    addressLineTwo: overrides.addressLineTwo ?? 'Apt 4',
    city: overrides.city ?? 'Springfield',
    state: overrides.state ?? 'IL',
    zipCode: overrides.zipCode ?? '62701',
    country: overrides.country ?? 'US',
    ...overrides,
  };
}

export function createMockTimeValue(overrides: Record<string, any> = {}) {
  return {
    time: overrides.time ?? '10:30',
    meridiem: overrides.meridiem ?? 'AM',
    ISOValue: overrides.ISOValue ?? '10:30:00',
    ...overrides,
  };
}

export function createMockZipCodeValue(overrides: Record<string, any> = {}) {
  return {
    countryCode: overrides.countryCode ?? 'US',
    zipCode: overrides.zipCode ?? '62701',
    ...overrides,
  };
}

export function createMockDropDownValue(overrides: Record<string, any> = {}) {
  return [
    { id: 'opt-1', label: overrides.label1 ?? 'Option 1' },
    { id: 'opt-2', label: overrides.label2 ?? 'Option 2' },
  ];
}

export function createMockRankingValue() {
  return [
    { id: 'rank-1', rank: 1, label: 'First' },
    { id: 'rank-2', rank: 2, label: 'Second' },
    { id: 'rank-3', rank: 3, label: 'Third' },
  ];
}

export function createMockAxios() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
}
