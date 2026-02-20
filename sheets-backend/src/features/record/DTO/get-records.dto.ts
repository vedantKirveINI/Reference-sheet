import {
  FilterOrEmptySchema,
  //   FilterSchema,
} from 'src/features/view/DTO/update_filter.dto';
import { SortSchema } from 'src/features/view/DTO/update_sort.dto';
import { GroupBySchema } from 'src/features/view/DTO/update_group_by.dto';
import { z } from 'zod';

export const GetRecordsPayloadSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  __status: z.enum(['active', 'inactive']).optional(),
  manual_filters: FilterOrEmptySchema.optional(),
  manual_sort: SortSchema.optional(),
  manual_group_by: GroupBySchema.optional(),
  includeGroupBy: z.boolean().optional(),
  state: z.record(z.any()).optional(),
  should_stringify: z.boolean().optional(),
  is_field_required: z.boolean().optional(),
  limit: z.number().int().min(0).optional(),
  offset: z.number().int().min(0).optional(),
  version: z.number().optional(),
  skip_filters: z.boolean().optional(),
  // Add new field for specifying which fields to return
  requiredFields: z
    .array(
      z.object({
        id: z.number(),
      }),
    )
    .optional(),
});

export type GetRecordsPayloadDTO = z.infer<typeof GetRecordsPayloadSchema>;
