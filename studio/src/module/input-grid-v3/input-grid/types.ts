export type DataType = 'String' | 'Number' | 'Boolean' | 'Object' | 'Array' | 'Int' | 'Any';

export type GridMode = 'fields' | 'schema';

export interface FxValue {
  type: 'fx';
  blocks: { type: string; value: string }[];
  blockStr: string;
}

export interface FieldData {
  id: string;
  type: DataType;
  key: string;
  isMap?: boolean;
  isValueMode?: boolean;
  isChecked?: boolean;
  default?: FxValue;
  value?: FxValue;
  schema?: FieldData[];
}

export interface InputGridProps {
  mode?: GridMode;
  devMode?: boolean;
  initialValue?: FieldData[];
  onChange?: (data: FieldData[]) => void;
  readOnly?: boolean;
  className?: string;
  valueCellMode?: "formula";
  variables?: Record<string, unknown>;
}

export interface RowProps {
  field: FieldData;
  index: number;
  depth: number;
  mode: GridMode;
  devMode: boolean;
  isLast: boolean;
  onUpdate: (id: string, updates: Partial<FieldData>) => void;
  onDelete: (id: string) => void;
  onAddChild?: (parentId: string) => void;
  onToggleCollapse?: (id: string) => void;
  collapsedIds: Set<string>;
  readOnly: boolean;
  onAddField?: () => void;
  onAddFieldWithoutFocus?: () => void;
  shouldFocus?: boolean;
  onFocusComplete?: () => void;
  parentType?: DataType;
  valueCellMode?: "formula";
  variables?: Record<string, unknown>;
}

export const TYPE_COLORS: Record<DataType, { bg: string; text: string; border: string }> = {
  String: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
  Number: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  Int: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20' },
  Boolean: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20' },
  Object: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
  Array: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  Any: { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/20' },
};

export const FRIENDLY_LABELS: Record<DataType, string> = {
  String: 'Text',
  Number: 'Number',
  Int: 'Integer',
  Boolean: 'Yes/No',
  Object: 'Object',
  Array: 'Array',
  Any: 'Any',
};

export const DEV_LABELS: Record<DataType, string> = {
  String: 'String',
  Number: 'Number',
  Int: 'Int',
  Boolean: 'Boolean',
  Object: 'Object',
  Array: 'Array',
  Any: 'Any',
};

export const TYPE_ICONS: Record<DataType, string> = {
  String: 'Type',
  Number: 'Hash',
  Int: 'Binary',
  Boolean: 'ToggleLeft',
  Object: 'Braces',
  Array: 'List',
  Any: 'Asterisk',
};

export const TYPE_DESCRIPTIONS: Record<DataType, string> = {
  String: 'Text value',
  Number: 'Decimal number',
  Int: 'Whole number',
  Boolean: 'True or false',
  Object: 'Group of fields',
  Array: 'List of items',
  Any: 'Any type',
};

