import { z } from 'zod';

export const DeleteViewPayloadSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  baseId: z.string(),
});

export type DeleteViewPayloadDTO = z.infer<typeof DeleteViewPayloadSchema>;
