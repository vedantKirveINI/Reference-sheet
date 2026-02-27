import { z } from 'zod';

export const RoleEnum = z.enum(['OWNER', 'VIEWER', 'EDITOR', 'COMMENTATOR']);
export const GeneralRoleEnum = z.enum(['NONE', 'VIEWER', 'EDITOR']);

export const ShareAssetSchema = z.object({
  asset_ids: z.array(z.string()),
  general_role: GeneralRoleEnum.optional(),
  invitees: z.array(
    z.object({
      email_id: z.string(),
      remove: z.boolean().optional(),
      role: RoleEnum.optional(),
    }),
  ),
});

export type ShareAssetDTO = z.infer<typeof ShareAssetSchema>;
