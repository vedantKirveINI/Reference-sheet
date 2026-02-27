import { z } from 'zod';
import { TriggerConfigArraySchema } from './trigger-config.dto';

export const EventTypeEnum = z.enum([
  'create_record',
  'update_record',
  'delete_record',
]);

export const TriggerTypeEnum = z.enum(['TIME_BASED']);

const CreateDataStreamSchema = z
  .object({
    tableId: z.string(),
    isStreaming: z.boolean(),
    webhookUrl: z.string(),
    eventType: z.array(EventTypeEnum).optional(), // Required for event-based triggers
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

export const CreateDataStreamsSchema = z.array(CreateDataStreamSchema);

export type CreateDataStreamsDTO = z.infer<typeof CreateDataStreamsSchema>;
