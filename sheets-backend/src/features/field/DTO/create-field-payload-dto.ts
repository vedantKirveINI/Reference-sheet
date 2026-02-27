import { z } from 'zod';
import { numberOptionsSchema } from './db-data-type.dto';

export const createFieldPayloadSchema = z
  .object({
    tableId: z.string(),
    viewId: z.string(),
    baseId: z.string(),
    type: z.string(),
    name: z.string(),
    order: z.number().optional(),
    options: z.record(z.any()).optional(),
    description: z.string().optional(),
    expression: z.record(z.any()).optional(),
  })
  .superRefine((data, ctx) => {
    console.log(
      'superRefine',
      'data.type === DataTypes.NUMBER::',
      data.type === 'NUMBER',
    );

    if (data.type === 'NUMBER') {
      const result = numberOptionsSchema.safeParse(data.options);

      console.log('result::--->>>', result, result);

      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom, // customize your issue
          message: `options dont Match`,
        });
      }
    }
  });

export type createFieldPayloadDTO = z.infer<typeof createFieldPayloadSchema>;
