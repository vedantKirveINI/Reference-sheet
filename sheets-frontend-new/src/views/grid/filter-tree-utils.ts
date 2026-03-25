// Tree-based filter utilities for nested group conditions.
// Adapted from studio_v2_copy/src/module/condition-composer-v2/utils/helpers.ts

export interface FilterNode {
  id: string;
  // Leaf node properties (mutually exclusive with children)
  columnId?: string;
  operator?: string;
  value?: string;
  // Group node properties
  conjunction: "and" | "or";
  children?: FilterNode[];
}

// ----- Type guards -----

export function isGroupNode(node: FilterNode): boolean {
  return Array.isArray(node.children);
}

export function isLeafNode(node: FilterNode): boolean {
  return !Array.isArray(node.children);
}

// ----- ID generation -----

let idCounter = 0;

export function generateId(): string {
  idCounter += 1;
  return `fn_${Date.now()}_${idCounter}_${Math.random().toString(36).substring(2, 9)}`;
}

// ----- Factory functions -----

export function createEmptyLeaf(firstColumnId: string, defaultOperator: string): FilterNode {
  return {
    id: generateId(),
    columnId: firstColumnId,
    operator: defaultOperator,
    value: "",
    conjunction: "and",
  };
}

export function createEmptyRoot(): FilterNode {
  return {
    id: generateId(),
    conjunction: "and",
    children: [],
  };
}

export function createGroup(
  parentConjunction: "and" | "or",
  firstColumnId: string,
  defaultOperator: string
): FilterNode {
  return {
    id: generateId(),
    conjunction: parentConjunction === "and" ? "or" : "and",
    children: [createEmptyLeaf(firstColumnId, defaultOperator)],
  };
}

export function deepCloneWithNewIds(node: FilterNode): FilterNode {
  const cloned: FilterNode = { ...node, id: generateId() };
  if (node.children) {
    cloned.children = node.children.map((child) => deepCloneWithNewIds(child));
  }
  return cloned;
}

// ----- Path-based tree traversal -----
// Paths use the format: "children[0].children[1]" etc.

export function getNodeAtPath(root: FilterNode, path: string): FilterNode | null {
  if (!path) return root;

  const parts = path.split(".");
  let current: any = root;

  for (const part of parts) {
    const match = part.match(/children\[(\d+)\]/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (!current.children || index >= current.children.length) {
        return null;
      }
      current = current.children[index];
    } else {
      return null;
    }
  }

  return current as FilterNode;
}

export function getParentAndIndex(
  root: FilterNode,
  path: string
): { parent: FilterNode; index: number } | null {
  if (!path) return null;

  const parts = path.split(".");
  const lastPart = parts.pop();
  if (!lastPart) return null;

  const match = lastPart.match(/children\[(\d+)\]/);
  if (!match) return null;

  const index = parseInt(match[1], 10);
  const parentPath = parts.join(".");
  const parent = getNodeAtPath(root, parentPath);

  if (!parent || !parent.children) return null;

  return { parent, index };
}

export function updateNodeAtPath(
  root: FilterNode,
  path: string,
  updater: (node: FilterNode) => FilterNode
): FilterNode {
  if (!path) {
    return updater(root);
  }

  const result = { ...root };
  const parts = path.split(".");
  let current: any = result;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const match = part.match(/children\[(\d+)\]/);

    if (match) {
      const index = parseInt(match[1], 10);
      if (!current.children) return root;

      current.children = [...current.children];

      if (i === parts.length - 1) {
        current.children[index] = updater(current.children[index]);
      } else {
        current.children[index] = { ...current.children[index] };
        current = current.children[index];
      }
    }
  }

  return result;
}

// ----- Conversion helpers (backward compatibility) -----

import type { FilterRule } from "./filter-modal";

export function filterRulesToTree(rules: FilterRule[]): FilterNode {
  if (rules.length === 0) {
    return createEmptyRoot();
  }

  const conjunction = rules[0]?.conjunction || "and";
  return {
    id: generateId(),
    conjunction,
    children: rules.map((r) => ({
      id: generateId(),
      columnId: r.columnId,
      operator: r.operator,
      value: r.value,
      conjunction: conjunction,
    })),
  };
}

export function treeToFilterRules(root: FilterNode): FilterRule[] {
  if (!root.children || root.children.length === 0) return [];

  const rules: FilterRule[] = [];
  const flatten = (node: FilterNode, parentConjunction: "and" | "or") => {
    if (isLeafNode(node) && node.columnId) {
      rules.push({
        columnId: node.columnId,
        operator: node.operator || "contains",
        value: node.value || "",
        conjunction: parentConjunction,
      });
    } else if (node.children) {
      for (const child of node.children) {
        flatten(child, node.conjunction);
      }
    }
  };

  for (const child of root.children) {
    flatten(child, root.conjunction);
  }

  return rules;
}
