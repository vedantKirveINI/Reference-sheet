import { z } from 'zod';

export const GetSummarySchema = z.object({
  baseId: z.string(),
  table_ids: z.array(z.string()),
  is_fields_count_required: z.boolean().default(true),
  is_records_count_required: z.boolean().default(true),
});

export type GetSummaryDTO = z.infer<typeof GetSummarySchema>;
