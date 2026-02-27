import { z } from 'zod';

export const UpdateRecordColorsSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  rowId: z.number(),
  rowColor: z.string().nullable().optional(),
  cellColors: z.record(z.string().nullable()).nullable().optional(),
});

export type UpdateRecordColorsDTO = z.infer<typeof UpdateRecordColorsSchema>;
