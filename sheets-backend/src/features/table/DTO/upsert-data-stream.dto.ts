import { z } from 'zod';
import { EventTypeEnum, TriggerTypeEnum } from './create-data-stream.dto';
import { TriggerConfigArraySchema } from './trigger-config.dto';

const DataStreamSchema = z
  .object({
    tableId: z.string(),
    webhookUrl: z.string().url(),
    eventType: z.array(EventTypeEnum).optional(), // Array of allowed event types (for event-based)
    triggerType: TriggerTypeEnum.optional(), // 'TIME_BASED' for time-based triggers
    triggerConfig: TriggerConfigArraySchema.optional(), // Array of trigger configs, required when triggerType is 'TIME_BASED'
    linkedAssetId: z.string().optional(),
  })
  .refine(
    (data) => {
      // If triggerType is TIME_BASED, triggerConfig must be present and have at least one item
      if (data.triggerType === 'TIME_BASED') {
        return (
          data.triggerConfig !== undefined && data.triggerConfig.length > 0
        );
      }
      // If triggerType is not set, eventType must be present (event-based trigger)
      if (!data.triggerType) {
        return data.eventType !== undefined && data.eventType.length > 0;
      }
      return true;
    },
    {
      message:
        'triggerConfig array with at least one item is required when triggerType is TIME_BASED, and eventType is required for event-based triggers',
    },
  );

const UpsertWhereSchema = z.union([
  z.object({
    id: z.string(),
    tableId: z.string().optional(),
    webhookUrl: z.string().optional(),
    linkedAssetId: z.string().optional(),
  }),

  z.object({
    linkedAssetId: z.string().optional(),
    tableId: z.string(),
    webhookUrl: z.string(),
  }),
]);

// Final schema for the upsert operation
export const UpsertDataStreamSchema = z.object({
  baseId: z.string(),
  where: UpsertWhereSchema, // `where` is now optional
  data: DataStreamSchema,
});

export type UpsertWhereDTO = z.infer<typeof UpsertWhereSchema>;

export type UpsertDataStreamDTO = z.infer<typeof UpsertDataStreamSchema>;
