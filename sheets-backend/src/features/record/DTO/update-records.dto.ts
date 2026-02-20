import { z } from 'zod';

export const FieldInfo = z.object({
  field_id: z.number(),
  data: z.any(),
});

export const ColumnValue = z.object({
  row_id: z.number().optional(),
  order: z.number().optional(),
  fields_info: z.array(FieldInfo),
});

export const UpdateRecordsSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string(),
  column_values: z.array(ColumnValue),
});

export type ColumnValueDTO = z.infer<typeof ColumnValue>;

export type UpdateRecordsDTO = z.infer<typeof UpdateRecordsSchema>;
