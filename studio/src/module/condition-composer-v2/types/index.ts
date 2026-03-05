export interface Operator {
  key: string;
  value: string;
}

export interface SummarySegment {
  type: 'text' | 'variable' | 'operator' | 'field';
  value: string;
}

export interface ConditionValue {
  blocks?: { value?: string; type?: string }[];
  type?: string;
}

export interface ConditionNode {
  id: string;
  key?: string;
  label?: string;
  field?: string;
  type?: string;
  operator?: Operator;
  value?: ConditionValue | string;
  valueStr?: string;
  nested_key?: string;
  condition?: 'and' | 'or';
  childs?: ConditionNode[];
}

export interface SchemaFieldOption {
  value: string | number | boolean;
  label?: string;
}

export interface SchemaField {
  name: string;
  field: string;
  type: string;
  label?: string;
  data_type?: string;
  options?: (SchemaFieldOption | string | number | boolean)[];
}

export interface ConditionComposerV2Props {
  initialValue?: ConditionNode;
  schema?: SchemaField[];
  onChange?: (value: ConditionNode, whereClause: string) => void;
  variables?: Record<string, any>;
  effects?: any[];
}

export type ConditionAction =
  | { type: 'SET_VALUE'; payload: ConditionNode }
  | { type: 'UPDATE_FIELD'; payload: { path: string; property: string; value: any } }
  | { type: 'ADD_CONDITION'; payload: { path: string; isGroup: boolean } }
  | { type: 'DELETE_CONDITION'; payload: { path: string } }
  | { type: 'CLONE_CONDITION'; payload: { path: string } }
  | { type: 'CHANGE_CONJUNCTION'; payload: { path: string; conjunction: 'and' | 'or' } }
  | { type: 'CLEAR_ALL' };
