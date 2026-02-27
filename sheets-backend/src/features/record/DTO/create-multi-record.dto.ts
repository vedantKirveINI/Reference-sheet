import { z } from 'zod';

const CreateRecordColumn = z.object({
  column_name: z.string(),
  data_type: z.string(),
});

export const CreateMutliRecordColumnSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  create_record_columns_payload: z.array(CreateRecordColumn),
});

export type CreateMutliRecordColumnDTO = z.infer<
  typeof CreateMutliRecordColumnSchema
>;
