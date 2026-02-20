import { z } from 'zod';

export const ClearFieldsDataSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string(),
  fields: z.array(
    z.object({
      id: z.number(),
    }),
  ),
});

export type ClearFieldsDatasDTO = z.infer<typeof ClearFieldsDataSchema>;
