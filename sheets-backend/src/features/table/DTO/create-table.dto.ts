import { z } from 'zod';

export const CreateTableSchema = z.object({
  name: z.string(),
  baseId: z.string(),
  schema_table_name: z.string().optional(),
  user_id: z.string(),
});

export type CreateTable = z.infer<typeof CreateTableSchema>;
