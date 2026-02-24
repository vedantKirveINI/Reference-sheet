import { z } from 'zod';

// Schema for enrichment field options
export const enrichmentOptionsSchema = z
  .object({
    config: z.record(z.any()),
    entityType: z.string(),
    autoUpdate: z.boolean().optional(),
  })
  .optional();

export type EnrichmentOptions = z.infer<typeof enrichmentOptionsSchema>;

// Schema for updating enrichment field
export const updateEnrichmentFieldSchema = z.object({
  id: z.number(),
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  options: enrichmentOptionsSchema,
});

// Type definition
export type UpdateEnrichmentFieldDto = z.infer<
  typeof updateEnrichmentFieldSchema
>;
