import { z } from 'zod';

export const createFieldSchema = z.object({
  name: z.string(),
  options: z.record(z.any()).optional(),
  type: z.string(),
  dbFieldType: z.string(),
  dbFieldName: z.string(),
  cellValueType: z.string(),
  tableMetaId: z.string(),
  order: z.number().optional(),
  description: z.string().optional(),
  computedFieldMeta: z.any().optional(),
  fieldFormat: z.any().optional(),
});

export type CreateFieldDto = z.infer<typeof createFieldSchema>;
