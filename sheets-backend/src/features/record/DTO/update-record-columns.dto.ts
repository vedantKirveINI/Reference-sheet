import { z } from 'zod';

export const records_payload = z.object({
  column_name: z.string(),
  data_type: z.string(),
});

export const updateRecordColumnsSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  records_payload: z.array(records_payload),
});

export type updateRecordColumnsDTO = z.infer<typeof updateRecordColumnsSchema>;
