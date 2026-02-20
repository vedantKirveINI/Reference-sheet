import { z } from 'zod';

export const GetHighestOrderColumnSchema = z.object({
  viewId: z.string(),
});

export type GetHighestOrderColumnDTO = z.infer<
  typeof GetHighestOrderColumnSchema
>;
