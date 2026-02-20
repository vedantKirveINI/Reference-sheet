import { z } from 'zod';

export const getFieldsByIdsSchema = z.object({
  ids: z.array(z.number()),
});

export type getFieldsByIdsDTO = z.infer<typeof getFieldsByIdsSchema>;
