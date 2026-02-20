import { z } from 'zod';
import { EventTypeEnum, TriggerTypeEnum } from './create-data-stream.dto';
import { TriggerTypeEnum as TriggerTypeEnumFromConfig } from './trigger-config.dto';

export const UpdateCriteriaSchema = z.object({
  id: z.string().optional(),
  tableId: z.string().optional(),
  webhookUrl: z.string().optional(),
  isStreaming: z.boolean().optional(),
});

// Update trigger config schema with optional id for matching existing schedules
export const UpdateTriggerConfigSchema = z
  .object({
    id: z.string().optional(), // Schedule ID for updates/deletes
    type: TriggerTypeEnumFromConfig,
    offsetMinutes: z.number().int().nonnegative(),
    fieldId: z.number().int().positive(),
    name: z.string().min(1),
  })
  .refine(
    (data) => {
      // For BEFORE and AFTER, offsetMinutes must be > 0
      if (data.type === 'BEFORE' || data.type === 'AFTER') {
        return data.offsetMinutes > 0;
      }
      // For EXACT, offsetMinutes can be 0 or any value (will be ignored)
      return true;
    },
    {
      message:
        'offsetMinutes must be greater than 0 for BEFORE and AFTER trigger types',
      path: ['offsetMinutes'],
    },
  );

export const UpdateTriggerConfigArraySchema = z
  .array(UpdateTriggerConfigSchema)
  .optional()
  .refine(
    (configs) => {
      if (!configs || configs.length === 0) return true;
      // Reject duplicate configs (same fieldId + type + offsetMinutes)
      const seen = new Set<string>();
      for (const config of configs) {
        const key = `${config.fieldId}-${config.type}-${config.offsetMinutes}`;
        if (seen.has(key)) return false;
        seen.add(key);
      }
      return true;
    },
    { message: 'Duplicate trigger configurations are not allowed' },
  );

export const UpdateDataSchema = z
  .object({
    isStreaming: z.boolean().optional(),
    webhookUrl: z.string().optional(),
    tableId: z.string().optional(),
    eventType: z.array(EventTypeEnum).optional(),
    triggerType: TriggerTypeEnum.optional(),
    triggerConfig: UpdateTriggerConfigArraySchema,
  })
  .refine(
    (data) => {
      // If triggerType is TIME_BASED, triggerConfig must be present and have at least one item
      if (data.triggerType === 'TIME_BASED') {
        return (
          data.triggerConfig !== undefined && data.triggerConfig.length > 0
        );
      }
      return true;
    },
    {
      message:
        'triggerConfig array with at least one item is required when triggerType is TIME_BASED',
      path: ['triggerConfig'],
    },
  );

export const UpdateDataStreamSchema = z.object({
  where: UpdateCriteriaSchema,
  data: UpdateDataSchema,
});

export const UpdateDataStreamsSchema = z.array(UpdateDataStreamSchema);

export type UpdateDataStreamsDTO = z.infer<typeof UpdateDataStreamsSchema>;
