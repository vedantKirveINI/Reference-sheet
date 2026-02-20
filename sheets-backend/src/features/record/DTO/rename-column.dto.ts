import { z } from 'zod';

// Create a Zod schema for RenameColumn
export const RenameColumnSchema = z.object({
  current_name: z.string(),
  future_name: z.string(),
  baseId: z.string(),
  tableId: z.string(),
});

// Define a type from the Zod schema
export type RenameColumnDto = z.infer<typeof RenameColumnSchema>;
