import { z } from 'zod';

export const DisableDataStreamWhereSchema = z.object({
  linkedAssetId: z.string(),
});

export type DisableDataStreamWhereDTO = z.infer<
  typeof DisableDataStreamWhereSchema
>;
