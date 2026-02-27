import { z } from 'zod';

export const SearchUserSchema = z.object({
  q: z.string(),
  page: z.string().optional(),
  limit: z.string().optional(),
  workspace_id: z.string(),
});

export type SearchUserDto = z.infer<typeof SearchUserSchema>;
