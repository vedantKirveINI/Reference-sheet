import { createFieldDTO } from 'src/features/field/DTO/create-multiple-fields.dto';
import { z } from 'zod';

export const createFormSheetScehma = z.object({
  workspace_id: z.string(),
  access_token: z.string(),
  user_id: z.string(),
  parent_id: z.string().optional(),
  form_name: z.string(),
  fields_payload: z.array(createFieldDTO),
});

export type createFormSheetScehmeDTO = z.infer<typeof createFormSheetScehma>;
