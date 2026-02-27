import { z } from 'zod';

export const RestoreAssetSchema = z.object({
  asset_ids: z.array(z.string()),
});

export type RestoreAssetDTO = z.infer<typeof RestoreAssetSchema>;
