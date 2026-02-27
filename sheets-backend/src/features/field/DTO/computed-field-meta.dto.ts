import { z } from 'zod';

export const computedFieldMetaSchema = z.object({
  expression: z.record(z.any()),
  hasError: z.boolean().optional(),
});

export type ComputedFieldMetaDTO = z.infer<typeof computedFieldMetaSchema>;
