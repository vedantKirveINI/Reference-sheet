import { z } from 'zod';

export const createFieldDTO = z.object({
  type: z.string(),
  name: z.string(),
  options: z.record(z.any()).optional(),
  node_id: z.array(z.string()).optional(),
  id: z.string().optional(),
  source_id: z.number().optional(),
  width: z.number().optional(),
  text_wrap: z.string().optional(),
  computed_field_meta: z.any().optional(),
  description: z.string().optional(),
});

export type CreateField = z.infer<typeof createFieldDTO>;

export const createMultiFieldSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string().optional(),
  fields_payload: z.array(createFieldDTO),
  should_update_order_in_view: z.boolean().optional(),
});

export type CreateMultiFieldDto = z.infer<typeof createMultiFieldSchema>;
