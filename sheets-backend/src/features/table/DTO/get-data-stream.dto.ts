import { z } from 'zod';

export const GetDataStreamSchema = z.object({
  id: z.string().optional(),
  tableId: z.string().optional(),
  isStreaming: z.boolean().optional(),
  webhookUrl: z.string().optional(),
});

export type GetDataStreamDTO = z.infer<typeof GetDataStreamSchema>;
