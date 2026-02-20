import { z } from 'zod';
import { OrderInfo } from './create-record.dto';

const GetCorrectRowOrderSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  viewId: z.string(),
  order_info: OrderInfo,
});

export type GetCorrectRowOrderDTO = z.infer<typeof GetCorrectRowOrderSchema>;
