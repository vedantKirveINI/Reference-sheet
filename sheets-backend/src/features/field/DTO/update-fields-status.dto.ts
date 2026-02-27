import { z } from 'zod';

export const UpdateFieldsStatusSchema = z.object({
  tableId: z.string(), // refers to tableMetaId
  baseId: z.string(),
  status: z.string().optional().default('inactive'),
  fields: z
    .array(
      // Optional field IDs array
      z.object({
        id: z.number(),
        status: z.string().optional().default('inactive'),
      }),
    )
    .optional(),
});

export type UpdateFieldsStatusDTO = z.infer<typeof UpdateFieldsStatusSchema>;
