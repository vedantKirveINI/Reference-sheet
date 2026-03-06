import type { ConditionNode, ConditionAction, SchemaField } from '../types';
import {
  createEmptyCondition,
  createConditionGroup,
  createDefaultRoot,
  createEmptyRoot,
  deepCloneWithNewIds,
  getNodeAtPath,
  getParentAndIndex,
  updateNodeAtPath,
  getOperatorsByFieldInfo,
} from './helpers';

export function createConditionReducer(schema: SchemaField[]) {
  return function conditionReducer(state: ConditionNode, action: ConditionAction): ConditionNode {
    switch (action.type) {
      case 'SET_VALUE':
        return action.payload;

      case 'UPDATE_FIELD': {
        const { path, property, value } = action.payload;
        return updateNodeAtPath(state, path, (node) => {
          const updated = { ...node };
          
          if (property === 'key' && value && typeof value === 'object' && 'fieldInfo' in value) {
            const { fieldInfo, nestedField } = value;
            if (fieldInfo) {
              const operatorArr = getOperatorsByFieldInfo(fieldInfo, nestedField);
              const defaultOperator = operatorArr?.[0];
              const currentOperatorValid =
                node.operator &&
                operatorArr?.some(
                  (op) =>
                    op.value === node.operator?.value || op.value === node.operator?.key,
                );

              updated.key = fieldInfo.name;
              updated.field = fieldInfo.field;
              updated.type = fieldInfo.type;
              updated.nested_key = nestedField;
              updated.operator = currentOperatorValid ? node.operator : defaultOperator;
            } else {
              updated.key = '';
              updated.field = undefined;
              updated.type = undefined;
              updated.nested_key = undefined;
              updated.operator = undefined;
            }
          } else {
            updated[property] = value;
          }
          
          if (property === 'operator' && ['is empty', 'is not empty'].includes(value?.value)) {
            updated.value = undefined;
          }
          
          return updated;
        });
      }

      case 'ADD_CONDITION': {
        const { path, isGroup } = action.payload;
        
        if (!path && (!state.childs || state.childs.length === 0)) {
          return createDefaultRoot(schema);
        }

        const targetPath = path || '';
        return updateNodeAtPath(state, targetPath, (node) => {
          const newChild = isGroup
            ? createConditionGroup(node.condition || 'and', schema)
            : createEmptyCondition(schema);
          
          return {
            ...node,
            childs: [...(node.childs || []), newChild],
          };
        });
      }

      case 'DELETE_CONDITION': {
        const { path } = action.payload;
        
        const deleteInfo = getParentAndIndex(state, path);
        if (!deleteInfo) return state;
        
        const directParentPath = path.split('.').slice(0, -1).join('.');
        
        let result = updateNodeAtPath(state, directParentPath || '', (node) => ({
          ...node,
          childs: node.childs!.filter((_, i) => i !== deleteInfo.index),
        }));
        
        let currentPath = directParentPath;
        while (currentPath) {
          const currentNode = getNodeAtPath(result, currentPath);
          
          if (currentNode && currentNode.childs && currentNode.childs.length > 0) {
            break;
          }
          
          const parentInfo = getParentAndIndex(result, currentPath);
          if (!parentInfo) break;
          
          const parentPath = currentPath.split('.').slice(0, -1).join('.');
          result = updateNodeAtPath(result, parentPath || '', (node) => ({
            ...node,
            childs: node.childs!.filter((_, idx) => idx !== parentInfo.index),
          }));
          
          currentPath = parentPath;
        }
        
        if (!result.childs || result.childs.length === 0) {
          return {
            ...result,
            childs: [],
          };
        }
        
        return result;
      }

      case 'CLONE_CONDITION': {
        const { path } = action.payload;
        const info = getParentAndIndex(state, path);
        if (!info) return state;

        const { index } = info;
        const nodeToClone = getNodeAtPath(state, path);
        if (!nodeToClone) return state;

        const cloned = deepCloneWithNewIds(nodeToClone);
        const parentPath = path.split('.').slice(0, -1).join('.');

        return updateNodeAtPath(state, parentPath, (node) => {
          const newChilds = [...(node.childs || [])];
          newChilds.splice(index + 1, 0, cloned);
          return { ...node, childs: newChilds };
        });
      }

      case 'CHANGE_CONJUNCTION': {
        const { path, conjunction } = action.payload;
        return updateNodeAtPath(state, path, (node) => ({
          ...node,
          condition: conjunction,
        }));
      }

      case 'CLEAR_ALL':
        return createEmptyRoot();

      default:
        return state;
    }
  };
}
