import { createFieldDTO } from 'src/features/field/DTO/create-multiple-fields.dto';
import { z } from 'zod';

export const createDiscoverySheetSchema = z.object({
  workspace_id: z.string(),
  parent_id: z.string().optional(),
  table_name: z.string(),
  discovery_type: z.enum([
    'business_discovery',
    'influencer_discovery',
    'people_search',
    'funding_discovery',
    'agency_discovery',
    'hiring_discovery',
  ]),
  fields_payload: z.array(createFieldDTO),
  records: z.array(z.record(z.any())),
  search_params: z.record(z.any()).optional(),
  target_records: z.number().optional(),
});

export type CreateDiscoverySheetDTO = z.infer<
  typeof createDiscoverySheetSchema
>;
