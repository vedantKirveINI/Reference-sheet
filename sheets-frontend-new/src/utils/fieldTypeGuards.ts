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
  CellType.Formula,
  // Choice / categorical
  CellType.YesNo,
  CellType.SCQ,
  CellType.MCQ,
  CellType.DropDown,
  CellType.List,
  CellType.Checkbox,
  // Numeric
  CellType.Number,
  CellType.Rating,
  CellType.OpinionScale,
  CellType.Slider,
  // Date
  CellType.DateTime,
  CellType.CreatedTime,
  CellType.LastModifiedTime,
  // JSONB with extracted display value
  CellType.Currency,
  CellType.PhoneNumber,
]);

export function isGroupableFieldType(cellType: CellType): boolean {
  return GROUPABLE_FIELD_TYPES.has(cellType);
}

