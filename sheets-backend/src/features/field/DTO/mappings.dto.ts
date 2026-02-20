export const TYPE_MAPPING = {
  SHORT_TEXT: 'TEXT',
  LONG_TEXT: 'TEXT',
  MCQ: 'JSONB',
  SCQ: 'TEXT',
  PHONE_NUMBER: 'JSONB',
  ZIP_CODE: 'JSONB',
  DROP_DOWN: 'JSONB',
  DROP_DOWN_STATIC: 'JSONB',
  YES_NO: 'VARCHAR',
  EMAIL: 'VARCHAR',
  DATE: 'TIMESTAMPTZ',
  CURRENCY: 'JSONB',
  NUMBER: 'DOUBLE PRECISION',
  RATING: 'INTEGER',
  FILE_PICKER: 'JSONB',
  TIME: 'JSONB',
  ADDRESS: 'JSONB',
  UNKNOWN: 'TEXT',
  SIGNATURE: 'TEXT',
  FORMULA: 'TEXT',
  LIST: 'JSONB',
  ENRICHMENT: 'TEXT',
  RANKING: 'JSONB',
  SLIDER: 'INTEGER',
  OPINION_SCALE: 'INTEGER',
};

export enum QUESTION_TYPE {
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  MCQ = 'MCQ',
  SCQ = 'SCQ',
  PHONE_NUMBER = 'PHONE_NUMBER',
  ZIP_CODE = 'ZIP_CODE',
  DROP_DOWN = 'DROP_DOWN',
  DROP_DOWN_STATIC = 'DROP_DOWN_STATIC',
  YES_NO = 'YES_NO',
  EMAIL = 'EMAIL',
  DATE = 'DATE',
  CURRENCY = 'CURRENCY',
  NUMBER = 'NUMBER',
  RATING = 'RATING',
  FILE_PICKER = 'FILE_PICKER',
  TIME = 'TIME',
  ADDRESS = 'ADDRESS',
  SIGNATURE = 'SIGNATURE',
  UNKNOWN = 'UNKNOWN',
  LIST = 'LIST',
  ENRICHMENT = 'ENRICHMENT',
  CREATED_TIME = 'CREATED_TIME',
  RANKING = 'RANKING',
  SLIDER = 'SLIDER',
  OPINION_SCALE = 'OPINION_SCALE',
  ID = 'ID',
}

export const TYPE_VALUE_MAPPING = {
  SHORT_TEXT: 'string',
  LONG_TEXT: 'string',
  MCQ: 'array_of_strings',
  DROP_DOWN_STATIC: 'array_of_strings',
  SCQ: 'string',
  PHONE_NUMBER: 'object',
  ZIP_CODE: 'object',
  DROP_DOWN: 'array_of_objects',
  YES_NO: 'string',
  EMAIL: 'string',
  DATE: 'timestamptz',
  CURRENCY: 'object',
  NUMBER: 'number',
  RATING: 'number',
  FILE_PICKER: 'array_of_objects',
  TIME: 'object',
  ADDRESS: 'object',
  SIGNATURE: 'string',
  LIST: 'array_of_strings',
  ENRICHMENT: 'string',
  CREATED_TIME: 'timestamptz',
  RANKING: 'array_of_objects',
  SLIDER: 'number',
  OPINION_SCALE: 'number',
  ID: 'number',
};

export const JSONB_KEY_FOR_SEARCHING = {
  PHONE_NUMBER: 'phoneNumber',
  ZIP_CODE: 'zipCode',
  FILE_PICKER: 'url',
  DROP_DOWN: 'label',
  CURRENCY: 'currencyValue',
  TIME: 'time',
  ADDRESS: 'state',
  RANKING: 'label',
};

export const keys_with_data_type_jsonb = [
  'PHONE_NUMBER',
  'FILE_PICKER',
  'MCQ',
  'DROP_DOWN_STATIC',
  'DROP_DOWN',
  'ZIP_CODE',
  'ADDRESS',
  'LIST',
  'RANKING',
];

export const DATA_KEYS = {
  ADDRESS: [
    'city',
    'state',
    'country',
    'zipCode',
    'fullName',
    'addressLineOne',
    'addressLineTwo',
  ],
  PHONE_NUMBER: ['countryCode', 'phoneNumber', 'countryNumber'],
};

/**
 * System Field Mapping
 * Maps system field types to their database column names
 */
export const SYSTEM_FIELD_MAPPING: Record<string, string> = {
  [QUESTION_TYPE.ID]: '__id',
  [QUESTION_TYPE.CREATED_TIME]: '__created_time',
};
