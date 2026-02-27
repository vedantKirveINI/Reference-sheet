import { computedFieldMetaSchema } from 'src/features/field/DTO/computed-field-meta.dto';
import { z } from 'zod';

export const ResetFormulaFieldArtifactsParamsSchema = z.object({
  schema: z.string(),
  table: z.string(),
  dbFieldName: z.string(),
  computedFieldMeta: computedFieldMetaSchema,
});

export type ResetFormulaFieldArtifactsParamsDTO = z.infer<
  typeof ResetFormulaFieldArtifactsParamsSchema
>;
