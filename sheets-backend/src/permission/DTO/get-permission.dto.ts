import { z } from 'zod';

export const GetPermissionsSchema = z.object({
  token: z.string(),
  asset_id: z.string(),
  is_http: z.boolean().default(true),
});

export type GetPermissionsDTO = z.infer<typeof GetPermissionsSchema>;
