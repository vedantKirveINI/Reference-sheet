import { createFieldDTO } from 'src/features/field/DTO/create-multiple-fields.dto';
import { ProspectRunSchema } from 'src/features/table/DTO/prospect-run.dto';
import { z } from 'zod';

export const createAiEnrichmentSheetSchema = z.object({
  workspace_id: z.string(),
  user_id: z.string().optional(),
  parent_id: z.string().optional(),
  asset_name: z.string().optional(),
  table_name: z.string().optional(),
  fields_payload: z.array(createFieldDTO),
  icp_inputs: z.record(z.any()),
  prospect_inputs: ProspectRunSchema,
  records: z.array(z.record(z.any())).optional(),
});

export type CreateAiEnrichmentSheetDTO = z.infer<
  typeof createAiEnrichmentSheetSchema
>;
