import { z } from 'zod';

export const FindOneAssetSchema = z.object({
  _id: z.string(),
});

export type FindOneAssetDTO = z.infer<typeof FindOneAssetSchema>;
