import { z } from 'zod';
import { columnInfoSchema } from './add-data-from-csv.dto';

export const AddDataToNewTableFromCsvSchema = z.object({
  table_name: z.string(),
  baseId: z.string(),
  user_id: z.string(),
  is_first_row_header: z.boolean().default(false),
  url: z.string(),
  columns_info: z.array(columnInfoSchema).optional(),
});

export type AddDataToNewTableFromCsvDTO = z.infer<
  typeof AddDataToNewTableFromCsvSchema
>;
