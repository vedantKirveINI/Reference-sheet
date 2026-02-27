import { z } from 'zod';

// Main schema for creating enrichment field
export const createEnrichmentFieldSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  type: z.literal('ENRICHMENT'), // Must be exactly 'ENRICHMENT'
  entityType: z.string(), // Type of entity for enrichment (e.g., 'company', 'person', etc.)
  identifier: z.array(z.any()), // Fields used to identify the entity
  fieldsToEnrich: z.array(z.any()), // Fields that will be enriched
  options: z.record(z.any()).optional(),
});

export type CreateEnrichmentFieldDto = z.infer<
  typeof createEnrichmentFieldSchema
>;
