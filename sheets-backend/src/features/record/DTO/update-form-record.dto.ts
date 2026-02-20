import { z } from 'zod';

const FormFieldInfo = z.object({
  db_field_name: z.string(),
  value: z.unknown().refine((value) => value !== undefined, {
    message: 'Value is required',
  }),
});

export const UpdateFormRecordPayloadSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  row_id: z.string(),
  fields_info: z.array(FormFieldInfo),
});

export type UpdateFormRecordPayloadDTO = z.infer<
  typeof UpdateFormRecordPayloadSchema
>;
