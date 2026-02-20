import { z } from 'zod';

export const CreateRecordColumnSchema = z.object({
  table_name: z.string().optional(),
  column_name: z.string(),
  data_type: z.string(),
  tableId: z.string(),
  baseId: z.string(),
});

export type CreateRecordColumn = z.infer<typeof CreateRecordColumnSchema>;
