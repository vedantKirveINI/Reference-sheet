import { z } from 'zod';

export const GetViewPayloadSchema = z
  .object({
    is_field_required: z.boolean().optional(),
    baseId: z.string(), // Required field
    id: z.union([z.string(), z.array(z.string())]).optional(),
    user_id: z.string().optional(),
    name: z.string().optional(),
    tableId: z.string().optional(),
    createdBy: z.string().optional(),
    lastModifiedBy: z.string().optional(),
  })
  .refine(
    (data) =>
      Object.entries(data).some(
        ([key, value]) => key !== 'baseId' && value !== undefined,
      ),
    {
      message: 'At least one of field should be providede',
    },
  );

export type GetViewPayloadDTO = z.infer<typeof GetViewPayloadSchema>;
