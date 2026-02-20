import { z } from 'zod';

const GroupByObjectSchema = z.object({
  fieldId: z.number(),
  order: z.enum(['asc', 'desc']),
  dbFieldName: z.string().optional(),
  type: z.string(),
});

export const GroupBySchema = z.object({
  groupObjs: z.array(GroupByObjectSchema),
});

export type GroupByObject = z.infer<typeof GroupByObjectSchema>;
export type GroupBy = z.infer<typeof GroupBySchema>;

export const UpdateGroupByPayloadSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  baseId: z.string(),
  groupBy: GroupBySchema,
  should_stringify: z.boolean().optional(),
});

export type UpdateGroupByPayloadDTO = z.infer<
  typeof UpdateGroupByPayloadSchema
>;
