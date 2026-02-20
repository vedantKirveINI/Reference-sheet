import { FilterOrEmptySchema } from 'src/features/view/DTO/update_filter.dto';
import { z } from 'zod';

export const GetRecordPayloadSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  manual_filters: FilterOrEmptySchema.optional(),
  state: z.record(z.any()).optional(),
  __status: z.string().optional(),
});

export type GetRecordPayloadDTO = z.infer<typeof GetRecordPayloadSchema>;
