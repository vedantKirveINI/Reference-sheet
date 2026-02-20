import { z } from 'zod';

const updatedPayloadSchema = z.array(
  z.object({
    fields_info: z.array(
      z.object({
        dbFieldName: z.string(),
        data: z.any(),
      }),
    ),
    row_id: z.number().optional(),
  }),
);

export type UpdatedPayloadDTO = z.infer<typeof updatedPayloadSchema>;

export const HandleFormulaRecalculationSchema = z.object({
  tableId: z.string(),
  baseId: z.string(),
  updatedPayload: updatedPayloadSchema,
  isCreateMode: z.boolean(),
});

export type CreateRecordDTO = z.infer<typeof HandleFormulaRecalculationSchema>;
