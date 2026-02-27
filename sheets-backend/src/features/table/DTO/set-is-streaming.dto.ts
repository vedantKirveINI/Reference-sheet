import { z } from 'zod';

const SetIsStreamingWhereSchema = z
  .object({
    id: z.string().optional(),
    tableId: z.string().optional(),
    webhookUrl: z.string().optional(),
    linkedAssetId: z.string().optional(),
  })
  .refine(
    (where) =>
      where.id !== undefined ||
      where.tableId !== undefined ||
      where.webhookUrl !== undefined ||
      where.linkedAssetId !== undefined,
    {
      message:
        'At least one of id, tableId, webhookUrl, or linkedAssetId must be provided in `where`',
    },
  );

const SetIsStreamingDataSchema = z.object({
  isStreaming: z.union([z.literal(true), z.literal(false)]),
});

export const SetIsStreamingSchema = z.object({
  where: SetIsStreamingWhereSchema,
  data: SetIsStreamingDataSchema,
});

export type SetIsStreamingDTO = z.infer<typeof SetIsStreamingSchema>;
