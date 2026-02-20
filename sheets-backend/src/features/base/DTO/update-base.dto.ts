import { z } from 'zod';

const STATUS = ['active', 'inactive'] as const;

export const UpdateBaseStatusSchema = z.object({
  whereObj: z.object({
    id: z.array(z.string()).optional(),
    spaceId: z.array(z.string()).optional(),
  }),
  name: z.string().optional(),
  status: z.enum(STATUS).optional(),
});

export type UpdateBaseStatusDTO = z.infer<typeof UpdateBaseStatusSchema>;
