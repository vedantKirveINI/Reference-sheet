import { z } from 'zod';

export const TriggerTypeEnum = z.enum(['BEFORE', 'EXACT', 'AFTER']);

export const TriggerConfigSchema = z
  .object({
    type: TriggerTypeEnum,
    offsetMinutes: z.number().int().nonnegative(),
    fieldId: z.number().int().positive(),
    name: z.string().min(1),
    // timezone removed per requirements
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

export type TriggerConfig = z.infer<typeof TriggerConfigSchema>;

// Array schema for multiple trigger configurations
export const TriggerConfigArraySchema = z
  .array(TriggerConfigSchema)
  .min(1)
  .refine(
    (configs) => {
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

export type TriggerConfigArray = z.infer<typeof TriggerConfigArraySchema>;
