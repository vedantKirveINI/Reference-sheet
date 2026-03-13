import { z } from 'zod';

export const createAiColumnFieldSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  type: z.literal('AI_COLUMN'),
  aiPrompt: z.string().min(1, 'AI prompt is required'),
  sourceFields: z.array(
    z.object({
      field_id: z.number(),
      dbFieldName: z.string(),
      name: z.string(),
    }),
  ),
  aiModel: z.enum(['nano', 'mini', 'pro', 'max']).default('mini'),
  autoUpdate: z.boolean().default(true),
  options: z.record(z.any()).optional(),
});

export type CreateAiColumnFieldDto = z.infer<
  typeof createAiColumnFieldSchema
>;
