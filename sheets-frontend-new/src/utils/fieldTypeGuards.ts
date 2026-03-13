import { CellType } from '@/types';

export const BLOCKED_FIELD_TYPES = new Set<CellType>([
  CellType.Link,
  CellType.Lookup,
  CellType.Rollup,
]);

export function isBlockedFieldType(cellType: CellType): boolean {
  return BLOCKED_FIELD_TYPES.has(cellType);
}

// Field types that can participate in Group By.
export const GROUPABLE_FIELD_TYPES = new Set<CellType>([
  // Core text / identifiers
  CellType.String,
  CellType.Email,
  CellType.LongText,
  // Choice / categorical
  CellType.YesNo,
  CellType.SCQ,
  CellType.MCQ,
  CellType.DropDown,
  CellType.List,
  CellType.Checkbox,
  // Numeric-like
  CellType.Number,
  CellType.Rating,
  CellType.OpinionScale,
  CellType.Slider,
  CellType.Ranking,
  // Time / date
  CellType.DateTime,
  CellType.CreatedTime,
  CellType.LastModifiedTime,
  // User / actor
  CellType.User,
  CellType.CreatedBy,
  CellType.LastModifiedBy,
  // Time-only
  CellType.Time,
]);

export function isGroupableFieldType(cellType: CellType): boolean {
  return GROUPABLE_FIELD_TYPES.has(cellType);
}

