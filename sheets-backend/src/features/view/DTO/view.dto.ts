import { z } from 'zod';

export const ViewDtoSchema = z.object({
  id: z.string(),
  user_id: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  tableId: z.string(),
  type: z.string(),
  sort: z.any().nullable(),
  filter: z.any().nullable(),
  group: z.any().nullable(),
  options: z.any().nullable(),
  order: z.number(),
  version: z.number(),
  columnMeta: z.string(),
  enableShare: z.boolean().nullable(),
  shareId: z.string().nullable(),
  shareMeta: z.string().nullable(),
  createdTime: z.date(),
  lastModifiedTime: z.date().nullable(),
  deletedTime: z.date().nullable(),
  createdBy: z.string(),
  lastModifiedBy: z.string().nullable(),
  source_id: z.string().nullable(),
});

export type View = z.infer<typeof ViewDtoSchema>;
