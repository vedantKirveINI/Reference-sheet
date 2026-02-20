// export const DataTypes = {
//   short_text: 'TEXT',
//   long_text: 'TEXT',
//   mcq: 'JSONB',
//   scq: 'TEXT',
//   phone_number: 'JSOB',
//   zip_code: 'JSONB',
//   drop_down: 'JSOB',
//   yes_no: 'VARCHAR',
//   email: 'VARCHAR',
//   date: 'TIMESTAMP',
//   currency: 'JSONB',
//   number: 'REAL',
//   file_picker: 'JSONB',
//   time: 'JSONB',
// };

import { z } from 'zod';

export const DataTypes = {
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
  DATE: 'TIMESTAMP',
  CURRENCY: 'JSONB',
  NUMBER: 'DOUBLE PRECISION',
  RATING: 'INTEGER',
  FILE_PICKER: 'JSONB',
  TIME: 'JSONB',
  ADDRESS: 'JSONB',
};

export const numberOptionsSchema = z.object({
  min: z.union([z.string(), z.number()]).optional(),
  max: z.union([z.string(), z.number()]).optional(),
  defaultValue: z.union([z.string(), z.number()]).optional(),
  allowNegative: z.boolean().optional(),
  allowFraction: z.boolean().optional(),
});
