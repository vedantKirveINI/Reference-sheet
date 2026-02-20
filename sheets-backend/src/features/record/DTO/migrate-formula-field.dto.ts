import { z } from 'zod';

export const MigrateFormulaFieldDataSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  field_id: z.number().optional(),
});

export type MigrateFormulaFieldDataDTO = z.infer<
  typeof MigrateFormulaFieldDataSchema
>;
