import { z } from 'zod';
import { computedFieldMetaSchema } from './computed-field-meta.dto';

export const updateFieldSchema = z.object({
  id: z.number(),
  node_id: z.array(z.string()).optional(),
  name: z.string(),
  type: z.string(),
  status: z.string().optional(),
  options: z.any().optional(),
});

export const updateFieldsSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  update_fields: z.array(updateFieldSchema),
});

export type UpdateFieldsDTO = z.infer<typeof updateFieldsSchema>;

export const updateSingleFieldSchema = z.object({
  id: z.number(),
  tableId: z.string(),
  viewId: z.string(),
  baseId: z.string(),
  node_id: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  options: z.record(z.any()).optional(),
  computedFieldMeta: computedFieldMetaSchema.optional(),
});

export type UpdateSingleFieldDTo = z.infer<typeof updateSingleFieldSchema>;
