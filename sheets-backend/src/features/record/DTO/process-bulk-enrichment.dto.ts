import { z } from 'zod';

export const ProcessBulkEnrichmentSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string(),
  enrichedFieldId: z.number(),
  batchSize: z.number().int().min(1).max(50).optional().default(10),
});

export type ProcessBulkEnrichmentDTO = z.infer<
  typeof ProcessBulkEnrichmentSchema
>;
