import { z } from 'zod';

export const CreateBaseSchema = z.object({
  name: z.string(),
  spaceId: z.string(),
  createdBy: z.string(),
  user_id: z.string().optional(),
  access_token: z.string(),
  parent_id: z.string().optional(),
  source: z.string().optional().default(''),
});

export type CreateBaseDTO = z.infer<typeof CreateBaseSchema>;
