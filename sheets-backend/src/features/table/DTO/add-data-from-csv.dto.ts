import { z } from 'zod';

export const columnInfoSchema = z.object({
  dbFieldName: z.string().optional(),
  field_id: z.number().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  prev_index: z.number().optional(),
  new_index: z.number().optional(),
  meta: z
    .object({
      width: z.number().optional(),
      text_wrap: z.string().optional(),
    })
    .optional(),
});

export const AddDataFromCsvSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string(),
  is_first_row_header: z.boolean().default(false),
  url: z.string(),
  columns_info: z.array(columnInfoSchema).optional(),
});

export type AddDataFromCsvDTO = z.infer<typeof AddDataFromCsvSchema>;
