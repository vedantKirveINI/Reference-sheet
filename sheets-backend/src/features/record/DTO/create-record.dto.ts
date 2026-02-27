import { z } from 'zod';

export const FieldInfo = z.object({
  field_id: z.number(),
  data: z.any(),
});

export const OrderInfo = z.object({
  is_above: z.boolean(),
  __id: z.number(),
  order: z.number(),
});

export const CreateRecordSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string(),
  order: z.number().optional(),
  fields_info: z.array(FieldInfo).optional(),
  order_info: OrderInfo.optional(),
});

export type CreateRecordDTO = z.infer<typeof CreateRecordSchema>;
