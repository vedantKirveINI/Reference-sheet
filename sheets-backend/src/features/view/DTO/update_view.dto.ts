import { z } from 'zod';

export const UpdateViewPayloadSchema = z
  .object({
    id: z.string(),
    tableId: z.string(),
    baseId: z.string(),
    name: z.string().optional(),
    order: z.number().positive().optional(),
    options: z.any().optional(),
    type: z.string().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.order !== undefined ||
      data.options !== undefined ||
      data.type !== undefined,
    {
      message:
        'At least one of name, order, options or type must be provided',
    },
  );

export type UpdateViewPayloadDTO = z.infer<typeof UpdateViewPayloadSchema>;
