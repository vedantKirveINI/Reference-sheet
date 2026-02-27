import { z } from 'zod';

const TEXT_WRAP = ['wrap', 'ellipses'] as const;

const ColumnMetaSchema = z.object({
  id: z.number(),
  width: z.number().optional(),
  text_wrap: z.enum(TEXT_WRAP).optional(),
  is_hidden: z.boolean().optional(),
  color: z.string().nullable().optional(),
});

export const UpdateColumnMetaSchema = z.object({
  columnMeta: z.array(ColumnMetaSchema),
  viewId: z.string(),
  baseId: z.string(),
  tableId: z.string(),
});

export type UpdateColumnMetaDTO = z.infer<typeof UpdateColumnMetaSchema>;
