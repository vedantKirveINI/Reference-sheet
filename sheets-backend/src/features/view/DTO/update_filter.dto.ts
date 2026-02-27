import { z } from 'zod';

const OperatorSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const LeafNodeSchema = z.object({
  key: z.string(),
  field: z.union([z.string(), z.number()]),
  type: z.enum([
    'LONG_TEXT',
    'MCQ',
    'DROP_DOWN_STATIC',
    'PHONE_NUMBER',
    'SHORT_TEXT',
    'FILE_PICKER',
    'YES_NO',
    'SCQ',
    'DROP_DOWN',
    'DATE',
    'NUMBER',
    'EMAIL',
    'ZIP_CODE',
    'ADDRESS',
    'FORMULA',
    'CREATED_TIME',
    'RATING',
    'SLIDER',
    'OPINION_SCALE',
    'ID',
  ]),
  operator: OperatorSchema,
  value: z.any(),
  nested_key: z.string().optional(),
});

const GroupNodeSchema = z.object({
  id: z.string(),
  condition: z.enum(['and', 'or']),
  childs: z.array(z.lazy(() => ChildSchema)), // Recursive reference
});

const ChildSchema = z.union([LeafNodeSchema, GroupNodeSchema]);

export const FilterSchema = z.object({
  id: z.string(),
  condition: z.enum(['and', 'or']),
  childs: z.array(ChildSchema),
});

export const FilterOrEmptySchema = z.union([FilterSchema, z.object({})]);
export type Filter = z.infer<typeof FilterOrEmptySchema>;

export const UpdateFilterPayloadSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  baseId: z.string(),
  filter: FilterOrEmptySchema,
  should_stringify: z.boolean().optional(),
});

export type UpdateFilterPayloadDTO = z.infer<typeof UpdateFilterPayloadSchema>;
