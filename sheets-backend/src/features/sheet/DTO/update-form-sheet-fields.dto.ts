import { z } from 'zod';

export const field_payload = z.object({
  id: z.number().optional(),
  type: z.string(),
  name: z.string(),
  node_id: z.array(z.string()),
  options: z.any().optional(),
});

export const updateFormSheetFieldsSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  fields_payload: z.array(field_payload),
});

export type updateFormSheetFieldsDTO = z.infer<
  typeof updateFormSheetFieldsSchema
>;
