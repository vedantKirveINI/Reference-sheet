import { z } from 'zod';

const FieldStructureSchema = z.object({
  previous_index: z.number().optional(),
  current_index: z.number().optional(),
  order: z.number(),
  field_id: z.number(),
});

export const UpdateColumnOrderinSchema = z.object({
  baseId: z.string(),
  viewId: z.string(),
  tableId: z.string(),
  fields: z.array(FieldStructureSchema),
});

export type UpdateColumnOrderingDTO = z.infer<typeof UpdateColumnOrderinSchema>;
