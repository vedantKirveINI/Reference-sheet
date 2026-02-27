import { z } from 'zod';

export const CreateFormulaColumnSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  column_name: z.string(),
  field_id: z.number(),
  expression: z.any(),
});

export type CreateFormulaColumnDTO = z.infer<typeof CreateFormulaColumnSchema>;
