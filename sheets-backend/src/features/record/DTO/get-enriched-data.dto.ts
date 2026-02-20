import { z } from 'zod';

export const GetEnrichedDataSchema = z.object({
  meta: z.object({
    id: z.number(),
    baseId: z.string(),
    tableId: z.string(),
    viewId: z.string(),
    fieldsToEnrichWithData: z.array(z.any()),
    enrichedFieldId: z.number(),
  }),
  data: z.record(z.any()),
});

export type GetEnrichedDataDTO = z.infer<typeof GetEnrichedDataSchema>;
