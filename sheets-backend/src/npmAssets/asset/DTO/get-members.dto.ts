import { z } from 'zod';

export const GetMembersSchema = z.object({
  asset_id: z.string(),
});

export type GetMembersDTO = z.infer<typeof GetMembersSchema>;
