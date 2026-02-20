import { z } from 'zod';

export const GetTableSchema = z.object({
  tableId: z.string(),
  viewId: z.string().optional(),
  baseId: z.string(),
  is_field_required: z.enum(['true', 'false']).optional(),
  is_view_required: z.enum(['true', 'false']).optional(),
});

export type GetTableSchemaPayloadDTO = z.infer<typeof GetTableSchema>;
