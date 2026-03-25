// Reducer for tree-based filter state.
// Adapted from studio_v2_copy/src/module/condition-composer-v2/utils/reducer.ts

import type { FilterNode } from "./filter-tree-utils";
import {
  createEmptyLeaf,
  createGroup,
  createEmptyRoot,
  deepCloneWithNewIds,
  getNodeAtPath,
  getParentAndIndex,
  updateNodeAtPath,
} from "./filter-tree-utils";

export type FilterAction =
  | { type: "SET_VALUE"; payload: FilterNode }
  | { type: "ADD_CONDITION"; payload: { path: string; isGroup: boolean; firstColumnId: string; defaultOperator: string } }
  | { type: "DELETE_CONDITION"; payload: { path: string } }
  | { type: "CLONE_CONDITION"; payload: { path: string } }
  | { type: "UPDATE_FIELD"; payload: { path: string; property: string; value: any } }
  | { type: "CHANGE_CONJUNCTION"; payload: { path: string; conjunction: "and" | "or" } }
  | { type: "CLEAR_ALL" };

export function filterReducer(state: FilterNode, action: FilterAction): FilterNode {
  switch (action.type) {
    case "SET_VALUE":
      return action.payload;

    case "ADD_CONDITION": {
      const { path, isGroup, firstColumnId, defaultOperator } = action.payload;
      const targetPath = path || "";
      return updateNodeAtPath(state, targetPath, (node) => {
        const newChild = isGroup
          ? createGroup(node.conjunction, firstColumnId, defaultOperator)
          : createEmptyLeaf(firstColumnId, defaultOperator);
        return {
          ...node,
          children: [...(node.children || []), newChild],
        };
      });
    }

    case "DELETE_CONDITION": {
      const { path } = action.payload;
      const deleteInfo = getParentAndIndex(state, path);
      if (!deleteInfo) return state;

      const directParentPath = path.split(".").slice(0, -1).join(".");

      let result = updateNodeAtPath(state, directParentPath || "", (node) => ({
        ...node,
        children: node.children!.filter((_, i) => i !== deleteInfo.index),
      }));

      // Auto-remove empty parent groups (bubble up)
      let currentPath = directParentPath;
      while (currentPath) {
        const currentNode = getNodeAtPath(result, currentPath);
        if (currentNode && currentNode.children && currentNode.children.length > 0) {
          break;
        }

        const parentInfo = getParentAndIndex(result, currentPath);
        if (!parentInfo) break;

        const parentPath = currentPath.split(".").slice(0, -1).join(".");
        result = updateNodeAtPath(result, parentPath || "", (node) => ({
          ...node,
          children: node.children!.filter((_, idx) => idx !== parentInfo.index),
        }));
        currentPath = parentPath;
      }

      if (!result.children || result.children.length === 0) {
        return { ...result, children: [] };
      }

      return result;
    }

    case "CLONE_CONDITION": {
      const { path } = action.payload;
      const info = getParentAndIndex(state, path);
      if (!info) return state;

      const nodeToClone = getNodeAtPath(state, path);
      if (!nodeToClone) return state;

      const cloned = deepCloneWithNewIds(nodeToClone);
      const parentPath = path.split(".").slice(0, -1).join(".");

      return updateNodeAtPath(state, parentPath, (node) => {
        const newChildren = [...(node.children || [])];
        newChildren.splice(info.index + 1, 0, cloned);
        return { ...node, children: newChildren };
      });
    }

    case "UPDATE_FIELD": {
      const { path, property, value } = action.payload;
      return updateNodeAtPath(state, path, (node) => ({
        ...node,
        [property]: value,
      }));
    }

    case "CHANGE_CONJUNCTION": {
      const { path, conjunction } = action.payload;
      return updateNodeAtPath(state, path, (node) => ({
        ...node,
        conjunction,
      }));
    }

    case "CLEAR_ALL":
      return createEmptyRoot();

    default:
      return state;
  }
}
