import { z } from 'zod';
import { OrderInfo } from './create-record.dto';

export const MovedRows = z.object({
  __id: z.number(),
});

export const updateRowOrderSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string(),
  order_info: OrderInfo,
  moved_rows: z.array(MovedRows),
});

export type updateRowOrderDTO = z.infer<typeof updateRowOrderSchema>;
