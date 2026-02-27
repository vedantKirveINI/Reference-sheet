import { z } from 'zod';

const StatusEnum = z.enum(['inactive']);

export const UpdateRecordSchema = z.object({
  __id: z.number(),
  __status: StatusEnum,
});

export type UpdateRecordStatusDTO = z.infer<typeof UpdateRecordSchema>;

export const UpdateRecordsStatusSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string(),
  records: z.array(UpdateRecordSchema).optional().default([]),
});

export type UpdateRecordsStatusDTO = z.infer<typeof UpdateRecordsStatusSchema>;
