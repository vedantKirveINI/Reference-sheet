import { CellType } from "@/types";
import { mapFieldTypeToCellType } from "@/services/formatters";
import type { BackendOperatorKey } from "./filter-operator-mapping";

/** Normalize backend type strings (e.g. "DATE", "CREATED_TIME") to CellType so operator lookup works for prefill. */
function normalizeCellTypeForOperators(cellType: CellType | string): CellType {
  const s = String(cellType);
  if (/^[A-Z][A-Z0-9_]*$/.test(s)) {
    return mapFieldTypeToCellType(s);
  }
  return s as CellType;
}

export interface FilterOperator {
  id: string; // UI/stored id
  label: string; // Shown in dropdown
  backendKey: BackendOperatorKey; // Sent to backend in operator.key
}

const baseStringOps: FilterOperator[] = [
  { id: "contains", label: "contains", backendKey: "ilike" },
  { id: "does_not_contain", label: "does not contain", backendKey: "not_ilike" },
  { id: "equals", label: "equals", backendKey: "=" },
  { id: "does_not_equal", label: "does not equal", backendKey: "!=" },
  { id: "is_empty", label: "is empty", backendKey: "=''" },
  { id: "is_not_empty", label: "is not empty", backendKey: "!=''" },
];

const numberOps: FilterOperator[] = [
  { id: "equals", label: "=", backendKey: "=" },
  { id: "not_equals", label: "≠", backendKey: "!=" },
  { id: "greater_than", label: ">", backendKey: ">" },
  { id: "less_than", label: "<", backendKey: "<" },
  { id: "greater_or_equal", label: "≥", backendKey: ">=" },
  { id: "less_or_equal", label: "≤", backendKey: "<=" },
  { id: "is_empty", label: "is empty", backendKey: "is_null" },
  { id: "is_not_empty", label: "is not empty", backendKey: "is_not_null" },
];

const yesNoOps: FilterOperator[] = [
  { id: "is", label: "is", backendKey: "=" },
  { id: "is_not", label: "is not", backendKey: "!=" },
  { id: "is_empty", label: "is empty", backendKey: "=''" },
  { id: "is_not_empty", label: "is not empty", backendKey: "!=''" },
];

const scqDropDownOps: FilterOperator[] = [
  { id: "is", label: "is", backendKey: "=" },
  { id: "is_not", label: "is not", backendKey: "!=" },
  // SCQ is a single string value; treat empty/not-empty
  // like other text fields using '' / != ''.
  { id: "is_empty", label: "is empty", backendKey: "=''" },
  { id: "is_not_empty", label: "is not empty", backendKey: "!=''" },
];

const mcqListOps: FilterOperator[] = [
  // MCQ/List (and DROP_DOWN_STATIC) are stored as array-of-strings on the backend.
  // The backend supports multiple set-style operators via getArrayOfStringWhereQuery.
  { id: "has_any_of", label: "has any of", backendKey: "?|" },
  { id: "has_all_of", label: "has all of", backendKey: "@>" },
  { id: "has_none_of", label: "has none of", backendKey: "?|" },
  { id: "is_exactly", label: "is exactly", backendKey: "=" },
  { id: "is_empty", label: "is empty", backendKey: "=" },
  { id: "is_not_empty", label: "is not empty", backendKey: ">" },
];

const dropdownOps: FilterOperator[] = [
  // Backend expects symbolic operators for JSONB dropdowns:
  // &   -> has all of
  // |   -> has any of
  // !   -> has none of
  // ==  -> is exactly
  // []  -> is empty
  // [*] -> is not empty
  { id: "has_all_of", label: "has all of", backendKey: "&" },
  { id: "has_any_of", label: "has any of", backendKey: "|" },
  { id: "has_none_of", label: "has none of", backendKey: "!" },
  { id: "is_exactly", label: "is exactly", backendKey: "==" },
  { id: "is_empty", label: "is empty", backendKey: "[]" },
  { id: "is_not_empty", label: "is not empty", backendKey: "[*]" },
];

const dateOps: FilterOperator[] = [
  { id: "is", label: "is", backendKey: "=" },
  { id: "is_before", label: "is before", backendKey: "<" },
  { id: "is_after", label: "is after", backendKey: ">" },
  { id: "is_on_or_before", label: "is on or before", backendKey: "<=" },
  { id: "is_on_or_after", label: "is on or after", backendKey: ">=" },
  { id: "is_empty", label: "is empty", backendKey: "is_null" },
  { id: "is_not_empty", label: "is not empty", backendKey: "is_not_null" },
];

export function getOperatorsForCellType(cellType: CellType | string): FilterOperator[] {
  const normalized = normalizeCellTypeForOperators(cellType);
  switch (normalized) {
    case CellType.Number:
    case CellType.Rating:
    case CellType.Slider:
    case CellType.ID:
    case CellType.AutoNumber:
      return numberOps;
    case CellType.PhoneNumber:
    case CellType.ZipCode:
      return [
        { id: "contains", label: "contains", backendKey: "ilike" },
        { id: "does_not_contain", label: "does not contain", backendKey: "not_ilike" },
        { id: "is_empty", label: "is empty", backendKey: "=''" },
        { id: "is_not_empty", label: "is not empty", backendKey: "!=''" },
      ];
    case CellType.YesNo:
    case CellType.Checkbox:
      return yesNoOps;
    case CellType.SCQ:
      return scqDropDownOps;
    case CellType.DropDown:
      return dropdownOps;
    case CellType.MCQ:
    case CellType.List:
      return mcqListOps;
    case CellType.DateTime:
    case CellType.CreatedTime:
    case CellType.LastModifiedTime:
      return dateOps;
    default:
      return baseStringOps;
  }
}

export function findOperatorById(cellType: CellType | string, id: string): FilterOperator | undefined {
  const typeKey = String(cellType);
  const ops = getOperatorsForCellType(typeKey as CellType);
  return ops.find((op) => op.id === id);
}

export function findOperatorByBackendKey(
  cellType: CellType | string,
  backendKey: BackendOperatorKey,
): FilterOperator | undefined {
  const typeKey = String(cellType);
  const ops = getOperatorsForCellType(typeKey as CellType);
  return ops.find((op) => op.backendKey === backendKey);
}

