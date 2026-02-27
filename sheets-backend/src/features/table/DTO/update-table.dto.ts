import { z } from 'zod';

const STATUS = ['active', 'inactive'] as const;

export const UpdateTableScehma = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  baseId: z.string(),
});

export const UpdateMultipleTableSchema = z.object({
  whereObj: z.object({
    id: z.array(z.string()).optional(),
    baseId: z.array(z.string()).optional(),
  }),
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(STATUS).optional(),
  baseId: z.string(),
});

export type UpdateTableDTO = z.infer<typeof UpdateTableScehma>;
export type UpdateMultipleTableDTO = z.infer<typeof UpdateMultipleTableSchema>;
