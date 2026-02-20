import { z } from 'zod';

export const RoleEnum = z.enum(['OWNER', 'VIEWER', 'EDITOR', 'COMMENTATOR']);

export const InviteMembersSchema = z.object({
  workspace_id: z.string(),
  table_id: z.string(),
  notify: z.boolean(),
  asset_ids: z.array(z.string()),
  message: z.string().optional(),
  invitees: z.array(
    z.object({
      email_id: z.string(),
      role: RoleEnum,
    }),
  ),
});

export type InviteMembersDTO = z.infer<typeof InviteMembersSchema>;
