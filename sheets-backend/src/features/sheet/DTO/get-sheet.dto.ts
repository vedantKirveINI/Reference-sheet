import { z } from 'zod';

export const GetSheetSchema = z.object({
  baseId: z.string(),
  include_views: z.boolean().default(false),
  include_tables: z.boolean().default(false),
});

export type GetSheetDTO = z.infer<typeof GetSheetSchema>;
