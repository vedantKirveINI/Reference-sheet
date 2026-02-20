import { z } from 'zod';

export const paramsSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string(),
});

export type ParamsDto = z.infer<typeof paramsSchema>;
