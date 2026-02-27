import { z } from 'zod';
import { GetRecordPayloadSchema } from './get-record.dto';
import { FieldInfo } from './update-records.dto';

const baseSchema = GetRecordPayloadSchema.extend({
  is_upsert: z.boolean().optional(),
  is_single_update: z.boolean().optional(),
  is_delete: z.boolean().optional(),
});

export const UpdateRecordByFiltersSchema = baseSchema
  .extend({
    fields_info: z.array(FieldInfo).optional(),
    viewId: z.string(),
  })
  .refine(
    (data) => {
      if (data.is_delete) {
        return true; // If is_delete is true, fields_info can be optional
      }
      return data.fields_info !== undefined; // Otherwise, fields_info should be defined
    },
    {
      message: 'fields_info is required',
      path: ['fields_info'], // path to show the error message
    },
  );

export type UpdateRecordByFiltersDTO = z.infer<
  typeof UpdateRecordByFiltersSchema
>;
