import { describe, it, expect } from 'vitest';
import {
  formatDateDisplay,
  mapCellTypeToBackendFieldType,
  mapFieldTypeToCellType,
  COLUMN_WIDTH_MAPPING,
  parseColumnMeta,
  getColumnWidth,
  getColumnHiddenState,
  formatCell,
  formatCellDataForBackend,
  searchByRowOrder,
  findColumnInsertIndex,
  isOptimisticRecordId,
  isGridLikeView,
  isDefaultView,
  shouldApplyRealtimeGridUpdates,
  formatUpdatedRow,
  createEmptyCellForColumn,
  type ExtendedColumn,
} from '../formatters';
import { CellType } from '@/types/cell';

describe('formatDateDisplay', () => {
  const testDate = '2025-03-15T14:30:00Z';

  it('formats DDMMYYYY without time', () => {
    const result = formatDateDisplay(testDate, 'DDMMYYYY', '/', false, false);
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('formats MMDDYYYY without time', () => {
    const result = formatDateDisplay(testDate, 'MMDDYYYY', '/', false, false);
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('formats YYYYMMDD without time', () => {
    const result = formatDateDisplay(testDate, 'YYYYMMDD', '-', false, false);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('includes 12-hour time when includeTime is true', () => {
    const result = formatDateDisplay(testDate, 'DDMMYYYY', '/', true, false);
    expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)$/);
  });

  it('includes 24-hour time when isTwentyFourHourFormat is true', () => {
    const result = formatDateDisplay(testDate, 'DDMMYYYY', '/', true, true);
    expect(result).toMatch(/\d{2}:\d{2}$/);
    expect(result).not.toMatch(/AM|PM/);
  });

  it('returns empty string for null', () => {
    expect(formatDateDisplay(null, 'DDMMYYYY', '/', false, false)).toBe('');
  });

  it('returns raw string for invalid date', () => {
    expect(formatDateDisplay('not-a-date', 'DDMMYYYY', '/', false, false)).toBe('not-a-date');
  });

  it('uses custom separator', () => {
    const result = formatDateDisplay(testDate, 'DDMMYYYY', '-', false, false);
    expect(result).toContain('-');
  });

  it('defaults to DDMMYYYY for unknown format', () => {
    const result = formatDateDisplay(testDate, 'UNKNOWN', '/', false, false);
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('mapCellTypeToBackendFieldType', () => {
  it('maps String to SHORT_TEXT', () => {
    expect(mapCellTypeToBackendFieldType(CellType.String)).toBe('SHORT_TEXT');
  });

  it('maps Number to NUMBER', () => {
    expect(mapCellTypeToBackendFieldType(CellType.Number)).toBe('NUMBER');
  });

  it('maps DateTime to DATE', () => {
    expect(mapCellTypeToBackendFieldType(CellType.DateTime)).toBe('DATE');
  });

  it('maps Link to LINK', () => {
    expect(mapCellTypeToBackendFieldType(CellType.Link)).toBe('LINK');
  });

  it('maps Checkbox to CHECKBOX', () => {
    expect(mapCellTypeToBackendFieldType(CellType.Checkbox)).toBe('CHECKBOX');
  });

  it('maps Rollup to ROLLUP', () => {
    expect(mapCellTypeToBackendFieldType(CellType.Rollup)).toBe('ROLLUP');
  });

  it('maps Lookup to LOOKUP', () => {
    expect(mapCellTypeToBackendFieldType(CellType.Lookup)).toBe('LOOKUP');
  });

  it('defaults to SHORT_TEXT for unknown', () => {
    expect(mapCellTypeToBackendFieldType('UNKNOWN' as any)).toBe('SHORT_TEXT');
  });
});

describe('mapFieldTypeToCellType', () => {
  it('maps SHORT_TEXT to String', () => {
    expect(mapFieldTypeToCellType('SHORT_TEXT')).toBe(CellType.String);
  });

  it('maps LONG_TEXT to String', () => {
    expect(mapFieldTypeToCellType('LONG_TEXT')).toBe(CellType.String);
  });

  it('maps EMAIL to String', () => {
    expect(mapFieldTypeToCellType('EMAIL')).toBe(CellType.String);
  });

  it('maps FORMULA to String', () => {
    expect(mapFieldTypeToCellType('FORMULA')).toBe(CellType.String);
  });

  it('maps NUMBER to Number', () => {
    expect(mapFieldTypeToCellType('NUMBER')).toBe(CellType.Number);
  });

  it('maps PERCENT to Number', () => {
    expect(mapFieldTypeToCellType('PERCENT')).toBe(CellType.Number);
  });

  it('maps DATE to DateTime', () => {
    expect(mapFieldTypeToCellType('DATE')).toBe(CellType.DateTime);
  });

  it('maps DATE_TIME to DateTime', () => {
    expect(mapFieldTypeToCellType('DATE_TIME')).toBe(CellType.DateTime);
  });

  it('maps DROP_DOWN_STATIC to DropDown', () => {
    expect(mapFieldTypeToCellType('DROP_DOWN_STATIC')).toBe(CellType.DropDown);
  });

  it('maps LINK to Link', () => {
    expect(mapFieldTypeToCellType('LINK')).toBe(CellType.Link);
  });

  it('maps CHECKBOX to Checkbox', () => {
    expect(mapFieldTypeToCellType('CHECKBOX')).toBe(CellType.Checkbox);
  });

  it('defaults to String for unknown', () => {
    expect(mapFieldTypeToCellType('UNKNOWN_TYPE')).toBe(CellType.String);
  });
});

describe('COLUMN_WIDTH_MAPPING', () => {
  it('has expected widths', () => {
    expect(COLUMN_WIDTH_MAPPING.SHORT_TEXT).toBe(140);
    expect(COLUMN_WIDTH_MAPPING.LINK).toBe(200);
    expect(COLUMN_WIDTH_MAPPING.AUTO_NUMBER).toBe(100);
    expect(COLUMN_WIDTH_MAPPING.DEFAULT).toBe(150);
    expect(COLUMN_WIDTH_MAPPING.CHECKBOX).toBe(80);
  });
});

describe('parseColumnMeta', () => {
  it('parses valid JSON string', () => {
    const result = parseColumnMeta('{"col1":{"width":200}}');
    expect(result.col1.width).toBe(200);
  });

  it('returns empty object for null', () => {
    expect(parseColumnMeta(null)).toEqual({});
  });

  it('returns empty object for undefined', () => {
    expect(parseColumnMeta(undefined)).toEqual({});
  });

  it('returns empty object for empty string', () => {
    expect(parseColumnMeta('')).toEqual({});
  });

  it('returns empty object for invalid JSON', () => {
    expect(parseColumnMeta('{bad}')).toEqual({});
  });
});

describe('getColumnWidth', () => {
  it('returns meta width when available', () => {
    expect(getColumnWidth(1, 'SHORT_TEXT', { '1': { width: 300 } })).toBe(300);
  });

  it('returns field type width when no meta', () => {
    expect(getColumnWidth(1, 'LINK', {})).toBe(200);
  });

  it('returns default width for unknown type', () => {
    expect(getColumnWidth(1, 'UNKNOWN', {})).toBe(150);
  });

  it('ignores non-positive meta widths', () => {
    expect(getColumnWidth(1, 'SHORT_TEXT', { '1': { width: 0 } })).toBe(140);
    expect(getColumnWidth(1, 'SHORT_TEXT', { '1': { width: -10 } })).toBe(140);
  });

  it('handles string fieldId', () => {
    expect(getColumnWidth('col-1', 'NUMBER', { 'col-1': { width: 250 } })).toBe(250);
  });
});

describe('getColumnHiddenState', () => {
  it('returns true when is_hidden is true', () => {
    expect(getColumnHiddenState('1', { '1': { is_hidden: true } })).toBe(true);
  });

  it('returns false when is_hidden is false', () => {
    expect(getColumnHiddenState('1', { '1': { is_hidden: false } })).toBe(false);
  });

  it('returns false when field not in meta', () => {
    expect(getColumnHiddenState('1', {})).toBe(false);
  });

  it('returns false when is_hidden is undefined', () => {
    expect(getColumnHiddenState('1', { '1': {} })).toBe(false);
  });
});

describe('formatCell', () => {
  const makeCol = (type: CellType, rawType = 'SHORT_TEXT', rawOptions: any = {}): ExtendedColumn => ({
    id: 'col-1',
    name: 'Test',
    type,
    rawType,
    rawOptions,
    rawId: '1',
    dbFieldName: 'field_1',
    width: 150,
    options: rawOptions,
  });

  it('formats Number cell with valid number', () => {
    const cell = formatCell(42, makeCol(CellType.Number, 'NUMBER'));
    expect(cell.type).toBe(CellType.Number);
    expect(cell.data).toBe(42);
    expect(cell.displayData).toBe('42');
  });

  it('formats Number cell with null', () => {
    const cell = formatCell(null, makeCol(CellType.Number, 'NUMBER'));
    expect(cell.data).toBeNull();
    expect(cell.displayData).toBe('');
  });

  it('formats Number cell with NaN string', () => {
    const cell = formatCell('abc', makeCol(CellType.Number, 'NUMBER'));
    expect(cell.data).toBeNull();
    expect(cell.displayData).toBe('');
  });

  it('formats String cell', () => {
    const cell = formatCell('hello', makeCol(CellType.String));
    expect(cell.type).toBe(CellType.String);
    expect(cell.data).toBe('hello');
  });

  it('formats MCQ cell with array', () => {
    const cell = formatCell(['A', 'B'], makeCol(CellType.MCQ, 'MCQ'));
    expect(cell.type).toBe(CellType.MCQ);
    expect(cell.data).toEqual(['A', 'B']);
    expect(cell.displayData).toBe('A, B');
  });

  it('formats MCQ cell from JSON string', () => {
    const cell = formatCell('["X","Y"]', makeCol(CellType.MCQ, 'MCQ'));
    expect(cell.data).toEqual(['X', 'Y']);
  });

  it('formats SCQ cell', () => {
    const cell = formatCell('Option1', makeCol(CellType.SCQ, 'SCQ'));
    expect(cell.type).toBe(CellType.SCQ);
    expect(cell.data).toBe('Option1');
  });

  it('formats SCQ cell with null', () => {
    const cell = formatCell(null, makeCol(CellType.SCQ, 'SCQ'));
    expect(cell.data).toBeNull();
  });

  it('formats YesNo cell with boolean true', () => {
    const cell = formatCell(true, makeCol(CellType.YesNo, 'YES_NO'));
    expect(cell.data).toBe('Yes');
  });

  it('formats YesNo cell with boolean false', () => {
    const cell = formatCell(false, makeCol(CellType.YesNo, 'YES_NO'));
    expect(cell.data).toBe('No');
  });

  it('formats YesNo cell with string', () => {
    const cell = formatCell('Other', makeCol(CellType.YesNo, 'YES_NO'));
    expect(cell.data).toBe('Other');
  });

  it('formats PhoneNumber cell from object', () => {
    const val = { countryCode: 'US', countryNumber: '1', phoneNumber: '5551234' };
    const cell = formatCell(val, makeCol(CellType.PhoneNumber, 'PHONE_NUMBER'));
    expect(cell.type).toBe(CellType.PhoneNumber);
    expect(cell.displayData).toBe('+1 5551234');
  });

  it('formats PhoneNumber stripping leading + from countryNumber', () => {
    const val = { countryNumber: '+44', phoneNumber: '123' };
    const cell = formatCell(val, makeCol(CellType.PhoneNumber, 'PHONE_NUMBER'));
    expect(cell.displayData).toBe('+44 123');
  });

  it('formats ZipCode cell', () => {
    const val = { countryCode: 'US', zipCode: '10001' };
    const cell = formatCell(val, makeCol(CellType.ZipCode, 'ZIP_CODE'));
    expect(cell.type).toBe(CellType.ZipCode);
    expect(cell.displayData).toBe('US 10001');
  });

  it('formats Currency cell', () => {
    const val = { countryCode: 'US', currencyCode: 'USD', currencySymbol: '$', currencyValue: '100' };
    const cell = formatCell(val, makeCol(CellType.Currency, 'CURRENCY'));
    expect(cell.type).toBe(CellType.Currency);
    expect(cell.displayData).toContain('USD');
  });

  it('formats DropDown cell from array', () => {
    const val = [{ id: '1', label: 'Opt1' }, { id: '2', label: 'Opt2' }];
    const cell = formatCell(val, makeCol(CellType.DropDown, 'DROP_DOWN'));
    expect(cell.type).toBe(CellType.DropDown);
    expect(cell.displayData).toBe('Opt1, Opt2');
  });

  it('formats Address cell', () => {
    const val = { city: 'NYC', state: 'NY' };
    const cell = formatCell(val, makeCol(CellType.Address, 'ADDRESS'));
    expect(cell.type).toBe(CellType.Address);
    expect(cell.displayData).toBe('NYC, NY');
  });

  it('formats DateTime cell', () => {
    const cell = formatCell('2025-01-15T10:00:00Z', makeCol(CellType.DateTime, 'DATE', { dateFormat: 'MMDDYYYY', separator: '/' }));
    expect(cell.type).toBe(CellType.DateTime);
    expect(cell.displayData).toBeTruthy();
  });

  it('formats CreatedTime cell', () => {
    const cell = formatCell('2025-01-15T10:00:00Z', makeCol(CellType.CreatedTime, 'CREATED_TIME'));
    expect(cell.type).toBe(CellType.CreatedTime);
    expect((cell as any).readOnly).toBe(true);
  });

  it('formats Signature cell', () => {
    const cell = formatCell('base64data', makeCol(CellType.Signature, 'SIGNATURE'));
    expect(cell.type).toBe(CellType.Signature);
    expect(cell.data).toBe('base64data');
  });

  it('formats Slider cell', () => {
    const cell = formatCell(5, makeCol(CellType.Slider, 'SLIDER', { minValue: 0, maxValue: 10 }));
    expect(cell.type).toBe(CellType.Slider);
    expect(cell.data).toBe(5);
  });

  it('formats Rating cell', () => {
    const cell = formatCell(3, makeCol(CellType.Rating, 'RATING', { maxRating: 5 }));
    expect(cell.type).toBe(CellType.Rating);
    expect(cell.data).toBe(3);
  });

  it('formats OpinionScale cell', () => {
    const cell = formatCell(7, makeCol(CellType.OpinionScale, 'OPINION_SCALE'));
    expect(cell.type).toBe(CellType.OpinionScale);
    expect(cell.data).toBe(7);
  });

  it('formats Enrichment cell', () => {
    const cell = formatCell('enriched', makeCol(CellType.Enrichment, 'ENRICHMENT'));
    expect(cell.type).toBe(CellType.Enrichment);
    expect((cell as any).readOnly).toBe(true);
  });

  it('formats Link cell from array', () => {
    const val = [{ id: 1, title: 'Record 1' }];
    const cell = formatCell(val, makeCol(CellType.Link, 'LINK'));
    expect(cell.type).toBe(CellType.Link);
    expect(cell.displayData).toBe('Record 1');
  });

  it('formats User cell', () => {
    const val = [{ id: 'u1', name: 'John', email: 'john@test.com' }];
    const cell = formatCell(val, makeCol(CellType.User, 'USER'));
    expect(cell.type).toBe(CellType.User);
    expect(cell.displayData).toBe('John');
  });

  it('formats Checkbox cell with true', () => {
    const cell = formatCell(true, makeCol(CellType.Checkbox, 'CHECKBOX'));
    expect(cell.type).toBe(CellType.Checkbox);
    expect(cell.data).toBe(true);
  });

  it('formats AutoNumber cell', () => {
    const cell = formatCell(42, makeCol(CellType.AutoNumber, 'AUTO_NUMBER'));
    expect(cell.type).toBe(CellType.AutoNumber);
    expect((cell as any).readOnly).toBe(true);
  });

  it('formats Button cell', () => {
    const cell = formatCell(null, makeCol(CellType.Button, 'BUTTON', { label: 'Click me' }));
    expect(cell.type).toBe(CellType.Button);
  });

  it('formats List cell', () => {
    const cell = formatCell(['a', 'b'], makeCol(CellType.List, 'LIST'));
    expect(cell.data).toEqual(['a', 'b']);
    expect(cell.displayData).toBe('a, b');
  });

  it('formats Ranking cell', () => {
    const val = [{ rank: 1, label: 'First' }, { rank: 2, label: 'Second' }];
    const cell = formatCell(val, makeCol(CellType.Ranking, 'RANKING'));
    expect(cell.type).toBe(CellType.Ranking);
    expect(cell.displayData).toContain('First');
  });

  it('formats Time cell', () => {
    const val = { time: '10:30', meridiem: 'AM' };
    const cell = formatCell(val, makeCol(CellType.Time, 'TIME'));
    expect(cell.type).toBe(CellType.Time);
    expect(cell.displayData).toBe('10:30');
  });

  it('formats Rollup cell', () => {
    const cell = formatCell(42, makeCol(CellType.Rollup, 'ROLLUP'));
    expect(cell.type).toBe(CellType.Rollup);
    expect((cell as any).readOnly).toBe(true);
  });

  it('formats Lookup cell', () => {
    const cell = formatCell(['val1', 'val2'], makeCol(CellType.Lookup, 'LOOKUP'));
    expect(cell.type).toBe(CellType.Lookup);
    expect((cell as any).readOnly).toBe(true);
  });

  it('formats CreatedBy cell', () => {
    const val = { id: 'u1', name: 'Admin' };
    const cell = formatCell(val, makeCol(CellType.CreatedBy, 'CREATED_BY'));
    expect(cell.type).toBe(CellType.CreatedBy);
    expect(cell.displayData).toBe('Admin');
  });

  it('formats LastModifiedBy cell', () => {
    const val = { id: 'u1', name: 'Editor' };
    const cell = formatCell(val, makeCol(CellType.LastModifiedBy, 'LAST_MODIFIED_BY'));
    expect(cell.type).toBe(CellType.LastModifiedBy);
    expect(cell.displayData).toBe('Editor');
  });

  it('formats LastModifiedTime cell', () => {
    const cell = formatCell('2025-01-15T10:00:00Z', makeCol(CellType.LastModifiedTime, 'LAST_MODIFIED_TIME'));
    expect(cell.type).toBe(CellType.LastModifiedTime);
    expect((cell as any).readOnly).toBe(true);
  });

  it('formats Formula cell (via rawType FORMULA fallback)', () => {
    const cell = formatCell('=1+1', makeCol(CellType.String, 'FORMULA'));
    expect(cell.type).toBe(CellType.String);
    expect((cell as any).readOnly).toBe(true);
  });

  it('formats FileUpload cell', () => {
    const val = [{ url: 'http://test.com/f.pdf', size: 1024, mimeType: 'application/pdf' }];
    const cell = formatCell(val, makeCol(CellType.FileUpload, 'FILE_PICKER'));
    expect(cell.type).toBe(CellType.FileUpload);
    expect(cell.data).toEqual(val);
  });
});

describe('formatCellDataForBackend', () => {
  it('handles MCQ cell', () => {
    const result = formatCellDataForBackend({ type: CellType.MCQ, data: ['A', 'B'], displayData: '' } as any);
    expect(result).toEqual(['A', 'B']);
  });

  it('handles Number cell', () => {
    const result = formatCellDataForBackend({ type: CellType.Number, data: 42, displayData: '42' } as any);
    expect(result).toBe(42);
  });

  it('handles null Number cell', () => {
    const result = formatCellDataForBackend({ type: CellType.Number, data: null, displayData: '' } as any);
    expect(result).toBeNull();
  });

  it('handles PhoneNumber cell', () => {
    const data = { countryCode: 'US', countryNumber: '1', phoneNumber: '555' };
    const result = formatCellDataForBackend({ type: CellType.PhoneNumber, data, displayData: '' } as any);
    expect(result).toEqual(data);
  });

  it('handles DateTime cell', () => {
    const result = formatCellDataForBackend({ type: CellType.DateTime, data: '2025-01-01', displayData: '' } as any);
    expect(result).toBe('2025-01-01');
  });

  it('handles String cell', () => {
    const result = formatCellDataForBackend({ type: CellType.String, data: 'hello', displayData: 'hello' } as any);
    expect(result).toBe('hello');
  });

  it('handles Rating cell', () => {
    const result = formatCellDataForBackend({ type: CellType.Rating, data: 5, displayData: '5' } as any);
    expect(result).toBe(5);
  });

  it('handles Enrichment cell', () => {
    const result = formatCellDataForBackend({ type: CellType.Enrichment, data: null, displayData: '' } as any);
    expect(result).toBe('');
  });
});

describe('searchByRowOrder', () => {
  const records = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }] as any[];
  const rowHeaders = [
    { orderValue: 1 }, { orderValue: 2 }, { orderValue: 3 }, { orderValue: 4 }, { orderValue: 5 },
  ] as any[];

  it('finds exact match', () => {
    expect(searchByRowOrder(3, records, rowHeaders)).toBe(2);
  });

  it('returns insert position when not found', () => {
    expect(searchByRowOrder(2.5, records, rowHeaders)).toBe(2);
  });

  it('returns 0 for value before all', () => {
    expect(searchByRowOrder(0, records, rowHeaders)).toBe(0);
  });

  it('returns length for value after all', () => {
    expect(searchByRowOrder(10, records, rowHeaders)).toBe(5);
  });
});

describe('findColumnInsertIndex', () => {
  const columns = [
    { id: 'a', order: 1 },
    { id: 'b', order: 3 },
    { id: 'c', order: 5 },
  ] as any[];

  it('finds correct insert position', () => {
    expect(findColumnInsertIndex(columns, 2)).toBe(1);
  });

  it('returns 0 for order before all', () => {
    expect(findColumnInsertIndex(columns, 0)).toBe(0);
  });

  it('returns length for order after all', () => {
    expect(findColumnInsertIndex(columns, 10)).toBe(3);
  });

  it('returns length for undefined order', () => {
    expect(findColumnInsertIndex(columns, undefined)).toBe(3);
  });
});

describe('isOptimisticRecordId', () => {
  it('returns true for optimistic IDs', () => {
    expect(isOptimisticRecordId('record_123_abc')).toBe(true);
  });

  it('returns false for normal IDs', () => {
    expect(isOptimisticRecordId('rec-123')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isOptimisticRecordId('')).toBe(false);
  });
});

describe('isGridLikeView', () => {
  it('returns true for grid', () => {
    expect(isGridLikeView({ type: 'grid' })).toBe(true);
  });

  it('returns true for default_grid', () => {
    expect(isGridLikeView({ type: 'default_grid' })).toBe(true);
  });

  it('returns false for kanban', () => {
    expect(isGridLikeView({ type: 'kanban' })).toBe(false);
  });

  it('returns false for form', () => {
    expect(isGridLikeView({ type: 'form' })).toBe(false);
  });

  it('returns false for gallery', () => {
    expect(isGridLikeView({ type: 'gallery' })).toBe(false);
  });

  it('returns false for calendar', () => {
    expect(isGridLikeView({ type: 'calendar' })).toBe(false);
  });

  it('returns false for gantt', () => {
    expect(isGridLikeView({ type: 'gantt' })).toBe(false);
  });

  it('returns false for empty type', () => {
    expect(isGridLikeView({ type: '' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isGridLikeView(null)).toBe(false);
  });
});

describe('isDefaultView', () => {
  it('returns true for default_grid', () => {
    expect(isDefaultView({ type: 'default_grid' })).toBe(true);
  });

  it('returns false for grid', () => {
    expect(isDefaultView({ type: 'grid' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isDefaultView(null)).toBe(false);
  });
});

describe('shouldApplyRealtimeGridUpdates', () => {
  it('returns false for null view', () => {
    expect(shouldApplyRealtimeGridUpdates(null)).toBe(false);
  });

  it('returns true for empty type', () => {
    expect(shouldApplyRealtimeGridUpdates({ type: '' })).toBe(true);
  });

  it('returns true for undefined type', () => {
    expect(shouldApplyRealtimeGridUpdates({ type: undefined })).toBe(true);
  });

  it('returns true for grid type', () => {
    expect(shouldApplyRealtimeGridUpdates({ type: 'grid' })).toBe(true);
  });

  it('returns false for kanban', () => {
    expect(shouldApplyRealtimeGridUpdates({ type: 'kanban' })).toBe(false);
  });
});
