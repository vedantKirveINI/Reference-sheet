import {
  CellType,
  ICell,
  INumberCell,
  IMCQCell,
  ISCQCell,
  IYesNoCell,
  IPhoneNumberCell,
  IZipCodeCell,
  ICurrencyCell,
  IDropDownCell,
  IAddressCell,
  IDateTimeCell,
  ICreatedTimeCell,
  IRankingCell,
  IRatingCell,
  IOpinionScaleCell,
  IEnrichmentCell,
  ISignatureCell,
  ISliderCell,
  IFileUploadCell,
  ITimeCell,
  IStringCell,
  IFormulaCell,
} from '@/types/cell';
import { IColumn, IRecord, IRowHeader, RowHeightLevel } from '@/types/grid';

export interface ExtendedColumn extends IColumn {
  rawType: string;
  rawOptions?: any;
  rawId: string | number;
  dbFieldName: string;
  description?: string;
  computedFieldMeta?: any;
  fieldFormat?: any;
  entityType?: string;
  identifier?: any;
  fieldsToEnrich?: any;
  status?: string;
}

export interface RecordsFetchedPayload {
  fields: any[];
  records: any[];
  groupPoints?: any;
  viewId?: string;
}

export const mapFieldTypeToCellType = (fieldType: string): CellType => {
  switch (fieldType) {
    case 'SHORT_TEXT':
    case 'LONG_TEXT':
    case 'MULTI_LINE_TEXT':
    case 'EMAIL':
    case 'URL':
    case 'RICH_TEXT':
    case 'FORMULA':
      return CellType.String;
    case 'NUMBER':
    case 'PERCENT':
      return CellType.Number;
    case 'RATING':
      return CellType.Rating;
    case 'OPINION_SCALE':
      return CellType.OpinionScale;
    case 'MCQ':
    case 'SELECT':
      return CellType.MCQ;
    case 'YES_NO':
      return CellType.YesNo;
    case 'SCQ':
      return CellType.SCQ;
    case 'PHONE_NUMBER':
      return CellType.PhoneNumber;
    case 'ZIP_CODE':
      return CellType.ZipCode;
    case 'CURRENCY':
      return CellType.Currency;
    case 'DROP_DOWN':
    case 'DROP_DOWN_STATIC':
      return CellType.DropDown;
    case 'ADDRESS':
      return CellType.Address;
    case 'DATE_TIME':
    case 'DATE':
      return CellType.DateTime;
    case 'RANKING':
      return CellType.Ranking;
    case 'SIGNATURE':
      return CellType.Signature;
    case 'SLIDER':
      return CellType.Slider;
    case 'FILE_PICKER':
      return CellType.FileUpload;
    case 'TIME':
      return CellType.Time;
    case 'ENRICHMENT':
      return CellType.Enrichment;
    case 'LIST':
      return CellType.List;
    case 'CREATED_TIME':
      return CellType.CreatedTime;
    default:
      return CellType.String;
  }
};

const parseJsonSafe = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const COLUMN_WIDTH_MAPPING: Record<string, number> = {
  SHORT_TEXT: 140,
  LONG_TEXT: 240,
  EMAIL: 140,
  ADDRESS: 140,
  NUMBER: 140,
  ZIP_CODE: 140,
  PHONE_NUMBER: 140,
  YES_NO: 140,
  SCQ: 140,
  DROP_DOWN: 140,
  MCQ: 140,
  DROP_DOWN_STATIC: 140,
  DATE: 140,
  TIME: 140,
  DATETIME: 140,
  FILE_UPLOAD: 140,
  SIGNATURE: 140,
  CURRENCY: 140,
  RANKING: 140,
  RATING: 140,
  OPINION_SCALE: 140,
  SLIDER: 140,
  FORMULA: 140,
  ENRICHMENT: 140,
  LIST: 140,
  DEFAULT: 150,
};

export const parseColumnMeta = (columnMeta: string | null | undefined): Record<string, any> => {
  if (!columnMeta) return {};
  try { return JSON.parse(columnMeta) || {}; } catch { return {}; }
};

export const getColumnWidth = (fieldId: number | string, fieldType: string, parsedColumnMeta: Record<string, any>): number => {
  const fieldIdKey = String(fieldId);
  const metaWidth = parsedColumnMeta[fieldIdKey]?.width;
  if (metaWidth && typeof metaWidth === 'number' && metaWidth > 0) return metaWidth;
  return COLUMN_WIDTH_MAPPING[fieldType] || COLUMN_WIDTH_MAPPING.DEFAULT || 150;
};

export const getColumnHiddenState = (fieldId: string | number, parsedColumnMeta: Record<string, any>): boolean => {
  return parsedColumnMeta[String(fieldId)]?.is_hidden === true;
};

export const formatCell = (
  rawValue: any,
  column: ExtendedColumn,
): ICell => {
  const { type, rawType, rawOptions } = column;

  if (type === CellType.Number) {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return { type: CellType.Number, data: null, displayData: '' } as INumberCell;
    }
    const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    return {
      type: CellType.Number,
      data: Number.isFinite(numericValue) ? numericValue : null,
      displayData: Number.isFinite(numericValue) ? String(numericValue) : '',
    } as INumberCell;
  }

  if (type === CellType.MCQ) {
    const parsed = Array.isArray(rawValue)
      ? rawValue
      : parseJsonSafe<string[]>(rawValue) || [];
    return {
      type: CellType.MCQ,
      data: parsed,
      displayData: JSON.stringify(parsed),
      options: rawOptions,
    } as IMCQCell;
  }

  if (type === CellType.List) {
    const parsed = Array.isArray(rawValue)
      ? rawValue
      : parseJsonSafe<Array<string | number>>(rawValue) || [];
    return {
      type: CellType.List,
      data: parsed,
      displayData: JSON.stringify(parsed),
    } as unknown as ICell;
  }

  if (type === CellType.SCQ) {
    const stringValue = rawValue === null || rawValue === undefined
      ? null
      : typeof rawValue === 'string' ? rawValue : String(rawValue);
    return {
      type: CellType.SCQ,
      data: stringValue,
      displayData: stringValue || '',
      options: rawOptions,
    } as ISCQCell;
  }

  if (type === CellType.YesNo) {
    const stringValue = rawValue === null || rawValue === undefined
      ? null
      : typeof rawValue === 'string'
        ? rawValue
        : typeof rawValue === 'boolean'
          ? rawValue ? 'Yes' : 'No'
          : String(rawValue);
    return {
      type: CellType.YesNo,
      data: stringValue as 'Yes' | 'No' | 'Other' | null,
      displayData: stringValue || '',
      options: rawOptions,
    } as IYesNoCell;
  }

  if (type === CellType.PhoneNumber) {
    let parsed: { countryCode: string; countryNumber: string; phoneNumber: string };
    if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
      parsed = {
        countryCode: rawValue.countryCode || '',
        countryNumber: rawValue.countryNumber || '',
        phoneNumber: rawValue.phoneNumber || '',
      };
    } else {
      parsed = parseJsonSafe<{ countryCode: string; countryNumber: string; phoneNumber: string }>(rawValue as string) || {
        countryCode: '', countryNumber: '', phoneNumber: '',
      };
    }
    return { type: CellType.PhoneNumber, data: parsed, displayData: JSON.stringify(parsed) } as IPhoneNumberCell;
  }

  if (type === CellType.ZipCode) {
    let parsed: { countryCode: string; zipCode: string };
    if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
      parsed = { countryCode: rawValue.countryCode || '', zipCode: rawValue.zipCode || '' };
    } else {
      parsed = parseJsonSafe<{ countryCode: string; zipCode: string }>(rawValue as string) || { countryCode: '', zipCode: '' };
    }
    return { type: CellType.ZipCode, data: parsed, displayData: JSON.stringify(parsed) } as IZipCodeCell;
  }

  if (type === CellType.Currency) {
    let parsed: any;
    if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
      parsed = {
        countryCode: rawValue.countryCode || '',
        currencyCode: rawValue.currencyCode || '',
        currencySymbol: rawValue.currencySymbol || '',
        currencyValue: rawValue.currencyValue || '',
      };
    } else {
      parsed = parseJsonSafe(rawValue as string) || {
        countryCode: '', currencyCode: '', currencySymbol: '', currencyValue: '',
      };
    }
    return { type: CellType.Currency, data: parsed, displayData: JSON.stringify(parsed) } as ICurrencyCell;
  }

  if (type === CellType.DropDown) {
    let parsed: any = null;
    if (Array.isArray(rawValue)) {
      parsed = rawValue;
    } else if (typeof rawValue === 'string') {
      parsed = parseJsonSafe(rawValue);
    }
    if (!parsed) parsed = [];
    return {
      type: CellType.DropDown,
      data: parsed,
      displayData: JSON.stringify(parsed),
      options: rawOptions,
    } as IDropDownCell;
  }

  if (type === CellType.Address) {
    let parsed: any = null;
    if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
      parsed = rawValue;
    } else if (typeof rawValue === 'string') {
      parsed = parseJsonSafe(rawValue);
    }
    let displayData = '';
    if (parsed) {
      const parts: string[] = [];
      if (parsed.fullName) parts.push(parsed.fullName);
      if (parsed.addressLineOne) parts.push(parsed.addressLineOne);
      if (parsed.addressLineTwo) parts.push(parsed.addressLineTwo);
      if (parsed.zipCode) parts.push(parsed.zipCode);
      if (parsed.city) parts.push(parsed.city);
      if (parsed.state) parts.push(parsed.state);
      if (parsed.country) parts.push(parsed.country);
      displayData = parts.join(', ');
    }
    return { type: CellType.Address, data: parsed, displayData } as IAddressCell;
  }

  if (type === CellType.DateTime) {
    let dateTimeString: string | null = null;
    if (typeof rawValue === 'string' && rawValue.trim() !== '') {
      dateTimeString = rawValue;
    } else if (rawValue !== null && rawValue !== undefined) {
      dateTimeString = String(rawValue);
    }
    let options: any = {};
    if (rawOptions) {
      if (rawOptions.includeTime !== undefined || rawOptions.dateFormat !== undefined) {
        options = rawOptions;
      } else if (rawOptions.options) {
        options = rawOptions.options;
      }
    }
    const {
      dateFormat = 'DDMMYYYY',
      separator = '/',
      includeTime: includeTimeRaw = undefined,
      isTwentyFourHourFormat: isTwentyFourHourFormatRaw = false,
    } = options;
    const defaultIncludeTime = rawType === 'DATE_TIME';
    const includeTime = includeTimeRaw !== undefined ? Boolean(includeTimeRaw) : defaultIncludeTime;
    const isTwentyFourHourFormat = Boolean(isTwentyFourHourFormatRaw);
    return {
      type: CellType.DateTime,
      data: dateTimeString,
      displayData: dateTimeString || '',
      options: { dateFormat, separator, includeTime, isTwentyFourHourFormat },
    } as IDateTimeCell;
  }

  if (type === CellType.CreatedTime) {
    let dateTimeString: string | null = null;
    if (typeof rawValue === 'string' && rawValue.trim() !== '') {
      dateTimeString = rawValue;
    }
    let options: any = {};
    if (rawOptions) {
      if (rawOptions.includeTime !== undefined || rawOptions.dateFormat !== undefined) {
        options = rawOptions;
      } else if (rawOptions.options) {
        options = rawOptions.options;
      }
    }
    const {
      dateFormat = 'DDMMYYYY',
      separator = '/',
      includeTime = true,
      isTwentyFourHourFormat = false,
    } = options;
    return {
      type: CellType.CreatedTime,
      data: dateTimeString,
      displayData: dateTimeString || '',
      readOnly: true as const,
      options: { dateFormat, separator, includeTime: Boolean(includeTime), isTwentyFourHourFormat: Boolean(isTwentyFourHourFormat) },
    } as ICreatedTimeCell;
  }

  if (type === CellType.Signature) {
    return {
      type: CellType.Signature,
      data: rawValue || null,
      displayData: rawValue || '',
    } as ISignatureCell;
  }

  if (type === CellType.Slider) {
    const numVal = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
    return {
      type: CellType.Slider,
      data: numVal !== null && Number.isFinite(numVal) ? numVal : null,
      displayData: numVal !== null && Number.isFinite(numVal) ? String(numVal) : '',
      options: {
        minValue: rawOptions?.minValue ?? 0,
        maxValue: rawOptions?.maxValue ?? 10,
      },
    } as ISliderCell;
  }

  if (type === CellType.FileUpload) {
    let parsed: any = null;
    if (Array.isArray(rawValue)) {
      parsed = rawValue;
    } else if (typeof rawValue === 'string') {
      parsed = parseJsonSafe(rawValue);
    }
    return {
      type: CellType.FileUpload,
      data: parsed,
      displayData: parsed ? JSON.stringify(parsed) : '',
      options: {
        maxFileSizeBytes: rawOptions?.maxFileSizeBytes ?? 10485760,
        allowedFileTypes: rawOptions?.allowedFileTypes ?? [],
        noOfFilesAllowed: rawOptions?.noOfFilesAllowed ?? 100,
      },
    } as IFileUploadCell;
  }

  if (type === CellType.Time) {
    let parsed: any = null;
    if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
      parsed = rawValue;
    } else if (typeof rawValue === 'string') {
      parsed = parseJsonSafe(rawValue);
    }
    return {
      type: CellType.Time,
      data: parsed,
      displayData: parsed ? (parsed.time || '') : '',
      options: { isTwentyFourHour: rawOptions?.isTwentyFourHour ?? false },
    } as ITimeCell;
  }

  if (type === CellType.Ranking) {
    let parsed: any = null;
    if (Array.isArray(rawValue)) {
      parsed = rawValue;
    } else if (typeof rawValue === 'string') {
      parsed = parseJsonSafe(rawValue);
    }
    return {
      type: CellType.Ranking,
      data: parsed,
      displayData: parsed ? JSON.stringify(parsed) : '',
      options: { options: rawOptions?.options || [] },
    } as IRankingCell;
  }

  if (type === CellType.Rating) {
    const numVal = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
    return {
      type: CellType.Rating,
      data: numVal !== null && Number.isFinite(numVal) ? numVal : null,
      displayData: numVal !== null && Number.isFinite(numVal) ? String(numVal) : '',
      options: {
        maxRating: rawOptions?.maxRating ?? 10,
        icon: rawOptions?.icon ?? 'star',
        ...(rawOptions?.color && { color: rawOptions.color }),
      },
    } as IRatingCell;
  }

  if (type === CellType.OpinionScale) {
    const numVal = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
    return {
      type: CellType.OpinionScale,
      data: numVal !== null && Number.isFinite(numVal) ? numVal : null,
      displayData: numVal !== null && Number.isFinite(numVal) ? String(numVal) : '',
      options: { maxValue: rawOptions?.maxValue ?? 10 },
    } as IOpinionScaleCell;
  }

  if (type === CellType.Enrichment) {
    return {
      type: CellType.Enrichment,
      data: rawValue ?? null,
      displayData: rawValue != null ? String(rawValue) : '',
      readOnly: true as const,
      options: {
        config: {
          identifier: (rawOptions?.identifier || rawOptions?.config?.identifier || []).map((ident: any) => ({
            field_id: ident.field_id || ident.fieldId,
            dbFieldName: ident.dbFieldName || ident.db_field_name,
            required: ident.required || false,
          })),
        },
      },
    } as IEnrichmentCell;
  }

  if (rawType === 'FORMULA') {
    return {
      type: CellType.String,
      data: rawValue != null ? String(rawValue) : '',
      displayData: rawValue != null ? String(rawValue) : '',
      readOnly: true,
      options: {
        computedFieldMeta: column.computedFieldMeta || {},
      },
    } as unknown as IFormulaCell;
  }

  const stringValue = rawValue != null ? String(rawValue) : '';
  return {
    type: CellType.String,
    data: stringValue,
    displayData: stringValue,
  } as IStringCell;
};

export const formatRecordsFetched = (
  payload: RecordsFetchedPayload,
  viewId: string,
  columnMeta?: string | null,
): { columns: ExtendedColumn[]; records: IRecord[]; rowHeaders: IRowHeader[] } => {
  const fields = payload?.fields || [];
  const rawRecords = payload?.records || [];
  const parsedColumnMeta = parseColumnMeta(columnMeta);

  const columns: ExtendedColumn[] = fields.map((field, index) => {
    const cellType = mapFieldTypeToCellType(field.type);
    const columnWidth = getColumnWidth(field.id, field.type, parsedColumnMeta);
    return {
      id: field.dbFieldName,
      name: field.name,
      type: cellType,
      width: columnWidth,
      isFrozen: false,
      order: typeof field.order === 'number' ? field.order : index + 1,
      rawType: field.type,
      rawOptions: field.options,
      rawId: field.id,
      dbFieldName: field.dbFieldName,
      description: field.description ?? '',
      computedFieldMeta: field.computedFieldMeta,
      fieldFormat: field.fieldFormat,
      entityType: field.entityType,
      identifier: field.identifier,
      fieldsToEnrich: field.fieldsToEnrich,
      options:
        cellType === CellType.MCQ || cellType === CellType.SCQ ||
        cellType === CellType.YesNo || cellType === CellType.DropDown
          ? field.options?.options || []
          : undefined,
      status: field.status,
    };
  });

  const rowOrderKey = viewId ? `_row_view${viewId}` : undefined;

  const records: IRecord[] = rawRecords.map((record, index) => {
    const cells: Record<string, ICell> = {};
    columns.forEach((column) => {
      const rawValue = record[column.id];
      cells[column.id] = formatCell(rawValue, column);
    });
    const _raw = record?.__created_time !== undefined
      ? { __created_time: record.__created_time ?? null }
      : undefined;
    return {
      id: String(record?.__id ?? index + 1),
      cells,
      ...(_raw ? { _raw } : {}),
    };
  });

  const rowHeaders: IRowHeader[] = records.map((rec, index) => ({
    id: rec.id,
    rowIndex: index,
    heightLevel: RowHeightLevel.Short,
    displayIndex: index + 1,
    orderValue:
      (rowOrderKey ? rawRecords[index]?.[rowOrderKey] : undefined) ??
      rawRecords[index]?.__id ??
      index + 1,
  }));

  return { columns, records, rowHeaders };
};

export const formatCreatedRow = (
  payload: any[],
  columns: ExtendedColumn[],
  viewId: string,
): { newRecord: IRecord; rowHeader: IRowHeader; orderValue: number | undefined } => {
  if (!payload || payload.length === 0) {
    throw new Error('Empty created_row payload');
  }
  const recordData = payload[0];
  const { __id, __status, socket_id, ...fieldData } = recordData;
  const rowOrderKey = viewId ? `_row_view${viewId}` : undefined;
  const orderValue = rowOrderKey ? fieldData[rowOrderKey] : undefined;
  const cells: Record<string, ICell> = {};

  columns.forEach((column) => {
    const rawValue = fieldData[column.id];
    if (rawValue !== undefined) {
      cells[column.id] = formatCell(rawValue, column);
    } else {
      cells[column.id] = createEmptyCellForColumn(column);
    }
  });

  const _raw = fieldData?.__created_time !== undefined
    ? { __created_time: fieldData.__created_time ?? null }
    : undefined;

  const newRecord: IRecord = {
    id: String(__id),
    cells,
    ...(_raw ? { _raw } : {}),
  };
  const rowHeader: IRowHeader = {
    id: String(__id),
    rowIndex: 0,
    heightLevel: RowHeightLevel.Short,
    displayIndex: 0,
    orderValue: orderValue ?? __id,
  };
  return { newRecord, rowHeader, orderValue };
};

export function createEmptyCellForColumn(column: ExtendedColumn): ICell {
  switch (column.type) {
    case CellType.Number:
      return { type: CellType.Number, data: null, displayData: '' } as INumberCell;
    case CellType.MCQ:
      return { type: CellType.MCQ, data: [], displayData: '[]', options: column.options } as unknown as IMCQCell;
    case CellType.SCQ:
      return { type: CellType.SCQ, data: null, displayData: '', options: column.options } as ISCQCell;
    case CellType.YesNo:
      return { type: CellType.YesNo, data: null, displayData: '', options: column.options } as IYesNoCell;
    case CellType.PhoneNumber:
      return { type: CellType.PhoneNumber, data: null, displayData: '' } as IPhoneNumberCell;
    case CellType.ZipCode:
      return { type: CellType.ZipCode, data: null, displayData: '' } as IZipCodeCell;
    case CellType.Currency:
      return { type: CellType.Currency, data: null, displayData: '' } as ICurrencyCell;
    case CellType.DropDown:
      return { type: CellType.DropDown, data: null, displayData: '[]', options: column.options } as IDropDownCell;
    case CellType.Address:
      return { type: CellType.Address, data: null, displayData: '' } as IAddressCell;
    case CellType.DateTime:
      return { type: CellType.DateTime, data: null, displayData: '', options: { dateFormat: 'DDMMYYYY', separator: '/', includeTime: false, isTwentyFourHourFormat: false } } as IDateTimeCell;
    case CellType.CreatedTime:
      return { type: CellType.CreatedTime, data: null, displayData: '', readOnly: true, options: { dateFormat: 'DDMMYYYY', separator: '/', includeTime: true, isTwentyFourHourFormat: false } } as ICreatedTimeCell;
    case CellType.Signature:
      return { type: CellType.Signature, data: null, displayData: '' } as ISignatureCell;
    case CellType.Slider:
      return { type: CellType.Slider, data: null, displayData: '', options: { minValue: column.rawOptions?.minValue ?? 0, maxValue: column.rawOptions?.maxValue ?? 10 } } as ISliderCell;
    case CellType.FileUpload:
      return { type: CellType.FileUpload, data: null, displayData: '', options: { maxFileSizeBytes: 10485760, noOfFilesAllowed: 100 } } as IFileUploadCell;
    case CellType.Time:
      return { type: CellType.Time, data: null, displayData: '', options: { isTwentyFourHour: false } } as ITimeCell;
    case CellType.Ranking:
      return { type: CellType.Ranking, data: null, displayData: '', options: { options: [] } } as IRankingCell;
    case CellType.Rating:
      return { type: CellType.Rating, data: null, displayData: '', options: { icon: 'star' } } as IRatingCell;
    case CellType.OpinionScale:
      return { type: CellType.OpinionScale, data: null, displayData: '', options: { maxValue: 10 } } as IOpinionScaleCell;
    case CellType.Enrichment:
      return { type: CellType.Enrichment, data: null, displayData: '', readOnly: true } as IEnrichmentCell;
    case CellType.List:
      return { type: CellType.List, data: [], displayData: '[]' } as unknown as ICell;
    default:
      if (column.rawType === 'FORMULA') {
        return { type: CellType.String, data: null, displayData: '', readOnly: true, options: { computedFieldMeta: column.computedFieldMeta || {} } } as unknown as IFormulaCell;
      }
      return { type: CellType.String, data: '', displayData: '' } as IStringCell;
  }
}

export const formatUpdatedRow = (
  payload: any[],
  allColumns: ExtendedColumn[],
  currentRecords: IRecord[],
): { updatedCells: Map<number, Record<string, ICell>>; socketId?: string; enrichedFieldIds: Array<{ rowId: number; fieldId: string }>; formulaFieldIds: Array<{ rowId: number; fieldId: string }> } => {
  const updatedCells = new Map<number, Record<string, ICell>>();
  let socketId: string | undefined;
  const enrichedFieldIds: Array<{ rowId: number; fieldId: string }> = [];
  const formulaFieldIds: Array<{ rowId: number; fieldId: string }> = [];

  payload.forEach((rowData) => {
    const { row_id, fields_info, socket_id, enrichedFieldId } = rowData;
    socketId = socket_id;
    if (enrichedFieldId) {
      enrichedFieldIds.push({ rowId: row_id, fieldId: enrichedFieldId });
    }
    const normalizedRowId = Number(row_id);
    const recordIndex = currentRecords.findIndex((record) => {
      const recordIdNum = Number(record.id);
      return recordIdNum === normalizedRowId || record.id === String(normalizedRowId);
    });
    if (recordIndex === -1) return;
    const record = currentRecords[recordIndex];
    const updatedCellsForRecord: Record<string, ICell> = { ...record.cells };
    fields_info.forEach(({ field_id, data }: { field_id: number; data: any }) => {
      const normalizedFieldId = Number(field_id);
      const column = allColumns.find((col) => {
        return col.rawId !== undefined &&
          (Number(col.rawId) === normalizedFieldId || String(col.rawId) === String(normalizedFieldId));
      });
      if (!column) return;
      if (column.rawType === 'FORMULA') {
        formulaFieldIds.push({ rowId: row_id, fieldId: String(column.rawId || column.id) });
      }
      updatedCellsForRecord[column.id] = formatCell(data, column);
    });
    updatedCells.set(row_id, updatedCellsForRecord);
  });

  return { updatedCells, socketId, enrichedFieldIds, formulaFieldIds };
};

export const formatCellDataForBackend = (cell: ICell): any => {
  let backendData: any = cell.data;
  switch (cell.type) {
    case CellType.MCQ:
    case CellType.DropDown:
      backendData = Array.isArray(cell.data) ? cell.data : [];
      break;
    case CellType.PhoneNumber:
    case CellType.ZipCode:
    case CellType.Currency:
    case CellType.Address:
      backendData = cell.data && typeof cell.data === 'object' ? cell.data : null;
      break;
    case CellType.Number:
    case CellType.Slider:
      backendData = typeof cell.data === 'number'
        ? cell.data
        : cell.data === null ? null : Number(cell.data) || null;
      break;
    case CellType.DateTime:
    case CellType.CreatedTime:
      backendData = typeof cell.data === 'string' ? cell.data : null;
      break;
    case CellType.FileUpload:
      backendData = Array.isArray(cell.data) && cell.data.length > 0
        ? JSON.stringify(cell.data) : null;
      break;
    case CellType.Time:
      backendData = cell.data && typeof cell.data === 'object'
        ? JSON.stringify(cell.data) : null;
      break;
    case CellType.Ranking:
      backendData = cell.data && Array.isArray(cell.data)
        ? JSON.stringify(cell.data) : null;
      break;
    case CellType.Rating:
    case CellType.OpinionScale:
      backendData = cell.data ?? null;
      break;
    case CellType.Enrichment:
      backendData = cell.data ?? '';
      break;
    default:
      backendData = cell.data ?? '';
  }
  return backendData;
};

export const searchByRowOrder = (newOrderValue: number, records: IRecord[], rowHeaders: IRowHeader[]): number => {
  let startIndex = 0;
  let endIndex = records.length - 1;
  while (startIndex <= endIndex) {
    const middleIndex = Math.floor((startIndex + endIndex) / 2);
    const middleHeader = rowHeaders[middleIndex];
    const middleOrder = middleHeader?.orderValue ?? middleHeader?.displayIndex ?? middleIndex + 1;
    if (middleOrder === newOrderValue) return middleIndex;
    else if (middleOrder < newOrderValue) startIndex = middleIndex + 1;
    else endIndex = middleIndex - 1;
  }
  return startIndex;
};

export const findColumnInsertIndex = (columns: ExtendedColumn[], newOrder: number | undefined): number => {
  if (typeof newOrder !== 'number') return columns.length;
  let start = 0;
  let end = columns.length;
  while (start < end) {
    const middle = Math.floor((start + end) / 2);
    const middleOrder = typeof columns[middle]?.order === 'number' ? columns[middle].order : middle + 1;
    if (middleOrder < newOrder) start = middle + 1;
    else end = middle;
  }
  return start;
};

export function isOptimisticRecordId(id: string): boolean {
  return /^record_\d+_[a-z0-9]+$/.test(id);
}

export const DEFAULT_VIEW_TYPE = 'default_grid';

const NON_GRID_VIEW_TYPES = ['form', 'gallery', 'kanban', 'calendar', 'gantt'] as const;

/** True when the view displays the record table/grid (so created_row should update the list). */
export function isGridLikeView(view: { type?: string } | null | undefined): boolean {
  const t = String(view?.type ?? '').toLowerCase();
  return t !== '' && !NON_GRID_VIEW_TYPES.includes(t as any);
}

export function isDefaultView(view: { type?: string } | null | undefined): boolean {
  return view?.type === DEFAULT_VIEW_TYPE;
}
