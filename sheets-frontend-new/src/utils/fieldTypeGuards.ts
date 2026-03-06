import { CellType } from '@/types';

export const BLOCKED_FIELD_TYPES = new Set<CellType>([
  CellType.Link,
  CellType.Lookup,
  CellType.Rollup,
]);

export function isBlockedFieldType(cellType: CellType): boolean {
  return BLOCKED_FIELD_TYPES.has(cellType);
}

