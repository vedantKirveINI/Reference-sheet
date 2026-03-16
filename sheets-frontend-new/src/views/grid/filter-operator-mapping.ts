import { CellType } from "@/types";
import { findOperatorByBackendKey, findOperatorById } from "./filter-operator-registry";

export type BackendOperatorKey =
  | "ilike"
  | "not_ilike"
  | "is_null"
  | "is_not_null"
  // Basic comparison operators
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  // Text/JSONB empty checks
  | "=''"        // JSONB/text empty
  | "!=''"       // JSONB/text not empty
  // MCQ / array-of-strings and dropdown JSONB operators
  | "?|"         // has any of (array-of-strings)
  | "@>"         // has all of (array-of-strings)
  | "&"          // has all of (dropdown JSONB)
  | "|"          // has any of (dropdown JSONB)
  | "!"          // has none of (dropdown JSONB)
  | "=="         // is exactly (dropdown JSONB)
  | "[]"         // is empty (dropdown JSONB)
  | "[*]";       // is not empty (dropdown JSONB)

export function mapUiOperatorToBackend(
  cellType: CellType | string,
  uiOperator: string
): BackendOperatorKey {
  const typeKey = String(cellType);
  const op = findOperatorById(typeKey, uiOperator);
  if (op) return op.backendKey;
  // Fallback: behave like generic text filter
  return "ilike";
}

const BACKEND_OPERATOR_KEYS: BackendOperatorKey[] = [
  "ilike",
  "not_ilike",
  "is_null",
  "is_not_null",
  "=",
  "!=",
  ">",
  "<",
  ">=",
  "<=",
  "=''",
  "!=''",
  "?|",
  "@>",
  "&",
  "|",
  "!",
  "==",
  "[]",
  "[*]",
];

/** Returns true if the value is a backend operator key (e.g. from API), not a UI operator value. */
export function isBackendOperatorKey(value: string): value is BackendOperatorKey {
  return BACKEND_OPERATOR_KEYS.includes(value as BackendOperatorKey);
}

/**
 * Maps a backend operator key (e.g. from saved filter) to the UI operator value
 * so the filter modal shows the correct option and label.
 */
export function mapBackendOperatorToUi(
  cellType: CellType | string,
  backendKey: string
): string {
  const typeKey = String(cellType);
  const key = backendKey as BackendOperatorKey;
  const op = findOperatorByBackendKey(typeKey, key);
  if (op) return op.id;
  // Fallback: generic text behavior
  return "contains";
}

