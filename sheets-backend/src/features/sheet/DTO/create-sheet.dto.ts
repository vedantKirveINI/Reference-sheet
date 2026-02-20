import { z } from 'zod';

// Main schema for creating a sheet
export const createSheetSchema = z.object({
  workspace_id: z.string(),
  user_id: z.string().optional().default('123'),
  parent_id: z.string().optional(),
  enrichment: z.record(z.any()).optional(),
});

export type CreateSheetDTO = z.infer<typeof createSheetSchema>;
