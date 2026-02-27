import { z } from 'zod';

const SortObjectSchema = z.object({
  fieldId: z.number(),
  order: z.enum(['asc', 'desc']),
  dbFieldName: z.string().optional(),
  type: z.string(),
});

export const SortSchema = z.object({
  sortObjs: z.array(SortObjectSchema),
  manualSort: z.boolean(),
});

export type Sort = z.infer<typeof SortSchema>;

export const UpdateSortPayloadSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  baseId: z.string(),
  sort: SortSchema,
  should_stringify: z.boolean().optional(),
});

export type UpdateSortPayloadDTO = z.infer<typeof UpdateSortPayloadSchema>;
