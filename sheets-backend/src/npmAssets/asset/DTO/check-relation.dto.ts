import { z } from 'zod';

export const CheckRelationSchema = z.object({
  workspace_id: z.string(),
  id: z.string(),
  sub_id: z.string(),
});

export type CheckRelationDTO = z.infer<typeof CheckRelationSchema>;

