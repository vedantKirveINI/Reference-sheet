import { z } from 'zod';

export const GetTablePayloadSchema = z.object({
  baseId: z.string(),
  user_id: z.string().optional(),
  is_field_required: z.enum(['true', 'false']).optional(),
  is_view_required: z.enum(['true', 'false']).optional(),
  table_ids: z.array(z.string()).optional(),
  orderByField: z.enum(['createdTime', 'lastModifiedTime']).optional(),
  orderByDirection: z.enum(['asc', 'desc']).optional(),
});

export type GetTablePayloadDTO = z.infer<typeof GetTablePayloadSchema>;
