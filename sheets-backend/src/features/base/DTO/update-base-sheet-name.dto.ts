import { z } from 'zod';

export const UpdateBaseSheetNameSchema = z.object({
  id: z.string(),
  name: z.string(),
  should_update_asset: z.boolean().default(true),
});

export type UpdateBaseSheetNameDTO = z.infer<typeof UpdateBaseSheetNameSchema>;
