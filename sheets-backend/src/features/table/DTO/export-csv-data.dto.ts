import { z } from 'zod';

export const ExportDataCSVSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  __status: z.enum(['active', 'inactive']).default('active'), // Default value set to 'active'
  should_stringify: z.boolean().default(true), // Default value set to true
});

export type ExportDataCSVPayload = z.infer<typeof ExportDataCSVSchema>;
