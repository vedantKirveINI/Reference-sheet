import { z } from 'zod';

export const CreateMultipleRecordsSchema = z.object({
  columns: z.array(z.string()),
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string(),
  records: z.array(z.record(z.unknown())).nonempty(),
});

export type CreateMultipleRecordsDTO = z.infer<
  typeof CreateMultipleRecordsSchema
>;
