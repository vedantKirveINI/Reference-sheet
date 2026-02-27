import { z } from 'zod';

export const CreateDuplicateBaseSchema = z.object({
  asset_id: z.string(),
  parent_id: z.string().optional(),
  name: z.string(),
  workspace_id: z.string(),
  user_id: z.string(),
});

export type CreateDuplicateBaseDTO = z.infer<typeof CreateDuplicateBaseSchema>;
