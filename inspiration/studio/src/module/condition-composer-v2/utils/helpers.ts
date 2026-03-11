import type { ConditionNode, SchemaField, Operator, SummarySegment } from '../types';
import { getDataTypeOperator } from '../../condition-composer/constant/dataOperator';
import NESTED_FIELD_MAPPING from '../../condition-composer/constant/nestedFieldMapping';

let idCounter = 0;

const EXCLUDED_OPERATORS = ['is...', 'is not...'];

export function getOperatorsByFieldInfo(
  fieldInfo: { type?: string; options?: { returnType?: string } },
  nestedKey: string = ''
): Operator[] {
  const { type, options = {} } = fieldInfo || {};

  let actualType = type?.toUpperCase() || '';

  if (actualType === 'FORMULA' && options?.returnType) {
    actualType = options.returnType.toUpperCase();
  }

  const operatorList = getDataTypeOperator(actualType) as Operator[];

  const hasNestedFields = actualType in NESTED_FIELD_MAPPING;
  if (!hasNestedFields || nestedKey) {
    return operatorList;
  }

  return operatorList.filter(
    (operator) => !EXCLUDED_OPERATORS.includes(operator.value)
  );
}

export function generateId(): string {
  idCounter += 1;
  return `cond_${Date.now()}_${idCounter}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createEmptyCondition(schema: SchemaField[]): ConditionNode {
  const firstField = schema[0];
  const operatorArr = firstField ? getDataTypeOperator(firstField.type?.toUpperCase()) : [];
  const defaultOperator = operatorArr?.[0] as Operator | undefined;
  
  return {
    id: generateId(),
    key: firstField?.name,
    field: firstField?.field,
    type: firstField?.type,
    operator: defaultOperator,
    value: '',
  };
}

export function createEmptyRoot(): ConditionNode {
  return {
    id: generateId(),
    condition: 'and',
    childs: [],
  };
}

export function createDefaultRoot(schema: SchemaField[]): ConditionNode {
  return {
    id: generateId(),
    condition: 'and',
    childs: [createEmptyCondition(schema)],
  };
}

export function createConditionGroup(parentCondition: 'and' | 'or', schema: SchemaField[]): ConditionNode {
  return {
    id: generateId(),
    condition: parentCondition === 'and' ? 'or' : 'and',
    childs: [createEmptyCondition(schema)],
  };
}

export function deepCloneWithNewIds(node: ConditionNode): ConditionNode {
  const cloned: ConditionNode = {
    ...node,
    id: generateId(),
  };

  if (node.childs && node.childs.length > 0) {
    cloned.childs = node.childs.map(child => deepCloneWithNewIds(child));
  }

  return cloned;
}

export function getNodeAtPath(root: ConditionNode, path: string): ConditionNode | null {
  if (!path) return root;

  const parts = path.split('.');
  let current: any = root;

  for (const part of parts) {
    const match = part.match(/childs\[(\d+)\]/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (!current.childs || index >= current.childs.length) {
        return null;
      }
      current = current.childs[index];
    } else {
      return null;
    }
  }

  return current as ConditionNode;
}

export function getParentAndIndex(root: ConditionNode, path: string): { parent: ConditionNode; index: number } | null {
  if (!path) return null;

  const parts = path.split('.');
  const lastPart = parts.pop();
  if (!lastPart) return null;

  const match = lastPart.match(/childs\[(\d+)\]/);
  if (!match) return null;

  const index = parseInt(match[1], 10);
  const parentPath = parts.join('.');
  const parent = getNodeAtPath(root, parentPath);

  if (!parent || !parent.childs) return null;

  return { parent, index };
}

export function updateNodeAtPath(
  root: ConditionNode,
  path: string,
  updater: (node: ConditionNode) => ConditionNode
): ConditionNode {
  if (!path) {
    return updater(root);
  }

  const result = { ...root };
  const parts = path.split('.');
  let current: any = result;
  const parents: { obj: any; key: string | number }[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const match = part.match(/childs\[(\d+)\]/);
    
    if (match) {
      const index = parseInt(match[1], 10);
      if (!current.childs) return root;
      
      current.childs = [...current.childs];
      parents.push({ obj: current, key: 'childs' });
      
      if (i === parts.length - 1) {
        current.childs[index] = updater(current.childs[index]);
      } else {
        current.childs[index] = { ...current.childs[index] };
        current = current.childs[index];
      }
    }
  }

  return result;
}

export function getHumanReadableSummary(conditions: ConditionNode | undefined): string {
  if (!conditions || !conditions.childs || conditions.childs.length === 0) {
    return '';
  }

  const isVariableBlock = (block: any) => 
    block.type === 'variable' || 
    block.type === 'NODE' || 
    block.type === 'LOCAL' || 
    block.type === 'GLOBAL' ||
    block.type === 'QUERY_PARAMS' ||
    block.subCategory === 'NODE' ||
    block.subCategory === 'LOCAL' ||
    block.subCategory === 'GLOBAL' ||
    block.subCategory === 'QUERY_PARAMS';

  const formatValue = (node: ConditionNode): string => {
    if (node.valueStr) {
      return `"${node.valueStr}"`;
    }
    if (typeof node.value === 'string') {
      return node.value ? `"${node.value}"` : '';
    }
    if (node.value && typeof node.value === 'object' && 'blocks' in node.value) {
      const blocks = (node.value.blocks || []) as any[];
      const parts: string[] = [];
      const hasVariables = blocks.some((b: any) => isVariableBlock(b));
      
      for (const b of blocks) {
        if (!b.value) continue;
        if (isVariableBlock(b)) {
          parts.push(`{{${b.value}}}`);
        } else {
          parts.push(b.value);
        }
      }
      
      if (parts.length === 0) return '';
      const combined = parts.join('');
      return hasVariables ? combined : `"${combined}"`;
    }
    return '';
  };

  const formatCondition = (node: ConditionNode): string => {
    if (node.childs && node.childs.length > 0) {
      const childStrings = node.childs
        .map(child => formatCondition(child))
        .filter(s => s.length > 0);
      
      if (childStrings.length === 0) return '';
      if (childStrings.length === 1) return childStrings[0];
      
      const connector = (node.condition || 'and').toUpperCase();
      return `(${childStrings.join(` ${connector} `)})`;
    }

    if (!node.key || !node.operator) return '';

    const field = node.label || node.key;
    const op = node.operator.value || node.operator.key || '';
    const value = formatValue(node);

    if (['is empty', 'is not empty'].includes(op)) {
      return `${field} ${op}`;
    }
    
    return value ? `${field} ${op} ${value}` : `${field} ${op}`;
  };

  const result = formatCondition(conditions);
  
  if (result.startsWith('(') && result.endsWith(')')) {
    return result.slice(1, -1);
  }
  
  return result;
}

export function getHumanReadableSummarySegments(conditions: ConditionNode | undefined): SummarySegment[] {
  if (!conditions || !conditions.childs || conditions.childs.length === 0) {
    return [];
  }

  const formatValue = (node: ConditionNode): SummarySegment[] => {
    if (node.valueStr) {
      return [{ type: 'text', value: `"${node.valueStr}"` }];
    }
    if (typeof node.value === 'string') {
      return node.value ? [{ type: 'text', value: `"${node.value}"` }] : [];
    }
    if (node.value && typeof node.value === 'object' && 'blocks' in node.value) {
      const blocks = (node.value.blocks || []).filter((b: any) => b.value);
      if (blocks.length === 0) return [];
      
      const isVariableBlock = (block: any) => 
        block.type === 'variable' || 
        block.type === 'NODE' || 
        block.type === 'LOCAL' || 
        block.type === 'GLOBAL' ||
        block.type === 'QUERY_PARAMS' ||
        block.subCategory === 'NODE' ||
        block.subCategory === 'LOCAL' ||
        block.subCategory === 'GLOBAL' ||
        block.subCategory === 'QUERY_PARAMS';
      
      const hasVariables = blocks.some((b: any) => isVariableBlock(b));
      
      if (!hasVariables) {
        const combinedText = blocks.map((b: any) => b.value).join('');
        return [{ type: 'text', value: `"${combinedText}"` }];
      }
      
      const segments: SummarySegment[] = [];
      for (const b of blocks) {
        if (!b.value) continue;
        if (isVariableBlock(b)) {
          segments.push({ type: 'variable', value: b.value });
        } else {
          segments.push({ type: 'text', value: b.value });
        }
      }
      return segments;
    }
    return [];
  };

  const formatCondition = (node: ConditionNode): SummarySegment[] => {
    if (node.childs && node.childs.length > 0) {
      const childSegments: SummarySegment[][] = node.childs
        .map(child => formatCondition(child))
        .filter(segments => segments.length > 0);
      
      if (childSegments.length === 0) return [];
      if (childSegments.length === 1) return childSegments[0];
      
      const connector = (node.condition || 'and').toUpperCase();
      const result: SummarySegment[] = [{ type: 'text', value: '(' }];
      
      childSegments.forEach((segments, index) => {
        if (index > 0) {
          result.push({ type: 'operator', value: connector });
        }
        result.push(...segments);
      });
      
      result.push({ type: 'text', value: ')' });
      return result;
    }

    if (!node.key || !node.operator) return [];

    const field = node.label || node.key;
    const op = node.operator.value || node.operator.key || '';
    const valueSegments = formatValue(node);

    const segments: SummarySegment[] = [
      { type: 'field', value: field },
      { type: 'operator', value: op },
    ];

    if (!['is empty', 'is not empty'].includes(op) && valueSegments.length > 0) {
      segments.push(...valueSegments);
    }

    return segments;
  };

  const result = formatCondition(conditions);
  
  if (result.length >= 2 && 
      result[0].type === 'text' && result[0].value === '(' &&
      result[result.length - 1].type === 'text' && result[result.length - 1].value === ')') {
    return result.slice(1, -1);
  }
  
  return result;
}

export function isEmptyCondition(node: ConditionNode): boolean {
  if (node.childs && node.childs.length > 0) {
    return node.childs.every(isEmptyCondition);
  }
  return !node.key || !node.operator;
}
