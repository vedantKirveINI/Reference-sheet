import { DataType, FieldData, FxValue, TYPE_COLORS } from './types';

export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const normalizeType = (type: string | undefined): DataType => {
  if (!type) return 'String';

  const typeMap: Record<string, DataType> = {
    'string': 'String',
    'text': 'String',
    'String': 'String',
    'number': 'Number',
    'Number': 'Number',
    'integer': 'Int',
    'int': 'Int',
    'Int': 'Int',
    'boolean': 'Boolean',
    'bool': 'Boolean',
    'Boolean': 'Boolean',
    'object': 'Object',
    'Object': 'Object',
    'array': 'Array',
    'Array': 'Array',
    'any': 'Any',
    'Any': 'Any',
  };

  return typeMap[type] || (TYPE_COLORS[type as DataType] ? type as DataType : 'String');
};

export interface NormalizeResult {
  fields: FieldData[];
  rootIsValueMode: boolean;
}

const ensureFieldId = (field: FieldData): FieldData => {
  const id = field.id || generateId();
  return {
    ...field,
    id,
    type: normalizeType(field.type as string),
    schema: field.schema ? field.schema.map(ensureFieldId) : undefined,
  };
};

const normalizeFieldTypes = (fields: FieldData[]): FieldData[] => {
  return fields.map(ensureFieldId);
};

const getInnerFields = (root: FieldData, isValueMode: boolean): FieldData[] | undefined => {
  if (isValueMode && root.value && Array.isArray(root.value)) {
    return root.value as unknown as FieldData[];
  }
  if (!isValueMode && root.schema && Array.isArray(root.schema)) {
    return root.schema;
  }
  return undefined;
};

export const normalizeInput = (payload: FieldData[]): NormalizeResult => {
  if (!payload || payload.length === 0) return { fields: [], rootIsValueMode: false };

  const normalizedPayload = normalizeFieldTypes(payload);

  if (normalizedPayload.length === 1 && (normalizedPayload[0].type === 'Object' || normalizedPayload[0].type === 'Array')) {
    const root = normalizedPayload[0];
    const rootIsValueMode = root.isValueMode === true;
    const innerFields = getInnerFields(root, rootIsValueMode);
    if (innerFields && Array.isArray(innerFields)) {
      return { fields: normalizeFieldTypes(innerFields), rootIsValueMode };
    }
  }

  return { fields: normalizedPayload, rootIsValueMode: false };
};

export const wrapOutput = (fields: FieldData[], isValueMode: boolean): FieldData[] => {
  if (fields.length === 0) return [];

  const configKey = isValueMode ? 'value' : 'schema';
  return [{
    id: `_${Date.now()}`,
    type: 'Object' as DataType,
    isValueMode,
    isMap: false,
    key: '',
    [configKey]: fields,
  }];
};

export const createFxValue = (value: string): FxValue => ({
  type: 'fx',
  blocks: [{ type: 'PRIMITIVES', value }],
  blockStr: value,
});

export const extractValue = (field: FieldData): string => {
  const fxValue = field.isValueMode ? field.value : field.default;
  return fxValue?.blockStr || '';
};

export const createEmptyField = (isValueMode: boolean = false, type: DataType = 'String'): FieldData => ({
  id: generateId(),
  type,
  key: '',
  isValueMode,
  isMap: false,
  ...(isValueMode ? { value: createFxValue('') } : { default: createFxValue('') }),
});

export const detectTypeFromValue = (value: unknown): DataType => {
  if (value === null || value === undefined) return 'String';
  if (typeof value === 'boolean') return 'Boolean';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'Int' : 'Number';
  }
  if (Array.isArray(value)) return 'Array';
  if (typeof value === 'object') return 'Object';
  return 'String';
};

export const convertJsonToFields = (json: unknown, isValueMode: boolean = false): FieldData[] => {
  if (typeof json !== 'object' || json === null) {
    return [createEmptyField(isValueMode)];
  }

  if (Array.isArray(json)) {
    return json.map((item, index) => {
      const type = detectTypeFromValue(item);
      const field: FieldData = {
        id: generateId(),
        type,
        key: '',
        isValueMode,
        isMap: false,
      };

      if (type === 'Object' || type === 'Array') {
        field.schema = convertJsonToFields(item, isValueMode);
      } else {
        const valueKey = isValueMode ? 'value' : 'default';
        field[valueKey] = createFxValue(String(item));
      }

      return field;
    });
  }

  return Object.entries(json).map(([key, value]) => {
    const type = detectTypeFromValue(value);
    const field: FieldData = {
      id: generateId(),
      type,
      key,
      isValueMode,
      isMap: false,
    };

    if (type === 'Object' || type === 'Array') {
      field.schema = convertJsonToFields(value, isValueMode);
    } else {
      const valueKey = isValueMode ? 'value' : 'default';
      field[valueKey] = createFxValue(String(value));
    }

    return field;
  });
};

const getFieldStr = (field: FieldData, valueKey: 'value' | 'default'): string => {
  const v = field[valueKey] ?? field[valueKey === 'value' ? 'default' : 'value'];
  if (!v) return '';
  return (v as { blockStr?: string; text?: string }).blockStr ?? (v as { blockStr?: string; text?: string }).text ?? '';
};

export const convertFieldsToJson = (fields: FieldData[], isValueMode: boolean = false): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  fields.forEach((field) => {
    const valueKey = isValueMode ? 'value' : 'default';
    const nested = (isValueMode && Array.isArray(field.value) ? field.value : field.schema) as FieldData[] | undefined;

    if (field.type === 'Object' && nested) {
      result[field.key] = convertFieldsToJson(nested, isValueMode);
    } else if (field.type === 'Array' && nested) {
      result[field.key] = nested.map((item) => {
        const itemNested = (isValueMode && Array.isArray(item.value) ? item.value : item.schema) as FieldData[] | undefined;
        if (item.type === 'Object' && itemNested) {
          return convertFieldsToJson(itemNested, isValueMode);
        }
        return getFieldStr(item, valueKey);
      });
    } else {
      const rawValue = getFieldStr(field, valueKey);

      if (field.type === 'Number') {
        result[field.key] = parseFloat(rawValue) || 0;
      } else if (field.type === 'Int') {
        result[field.key] = parseInt(rawValue, 10) || 0;
      } else if (field.type === 'Boolean') {
        result[field.key] = rawValue === 'true' || rawValue === '1' || rawValue === 'yes';
      } else {
        result[field.key] = rawValue;
      }
    }
  });

  return result;
};

export const parseCSVToFields = (csvText: string, isValueMode: boolean = false): FieldData[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [createEmptyField(isValueMode)];

  const headers = lines[0].split(',').map((h) => h.trim());
  const fields: FieldData[] = [];

  lines.slice(1).forEach((line, rowIndex) => {
    const values = line.split(',').map((v) => v.trim());
    const rowField: FieldData = {
      id: generateId(),
      type: 'Object',
      key: `row_${rowIndex}`,
      isValueMode,
      isMap: false,
      schema: headers.map((header, colIndex) => ({
        id: generateId(),
        type: 'String' as DataType,
        key: header,
        isValueMode,
        isMap: false,
        ...(isValueMode ? { value: createFxValue(values[colIndex] || '') } : { default: createFxValue(values[colIndex] || '') }),
      })),
    };
    fields.push(rowField);
  });

  return fields;
};

export const countChildren = (field: FieldData): number => {
  if (field.type === 'Object' || field.type === 'Array') {
    return field.schema?.length ?? 0;
  }
  return 0;
};

