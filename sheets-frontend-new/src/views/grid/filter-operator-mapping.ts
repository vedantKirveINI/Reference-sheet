import { CellType } from "@/types";

export type BackendOperatorKey =
  | "ilike"
  | "not_ilike"
  | "is_null"
  | "is_not_null"
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<=";

export function mapUiOperatorToBackend(
  cellType: CellType | string,
  uiOperator: string
): BackendOperatorKey {
  const textLikeTypes: Array<CellType | string> = [
    CellType.String,
    CellType.LongText,
    CellType.Email,
    CellType.Address,
    CellType.PhoneNumber,
    CellType.Formula,
  ];

  const numberLikeTypes: Array<CellType | string> = [
    CellType.Number,
    CellType.Rating,
    CellType.Slider,
    CellType.ID,
    CellType.AutoNumber,
  ];

  const zipCodeTypes: Array<CellType | string> = [CellType.ZipCode];

  const yesNoTypes: Array<CellType | string> = [CellType.YesNo, CellType.Checkbox];

  const scqTypes: Array<CellType | string> = [CellType.SCQ, CellType.DropDown];

  const mcqTypes: Array<CellType | string> = [CellType.MCQ, CellType.List];

  const dateTypes: Array<CellType | string> = [CellType.DateTime, CellType.CreatedTime];

  const typeKey = String(cellType);

  const inSet = (set: Array<CellType | string>) => set.some((t) => String(t) === typeKey);

  if (inSet(numberLikeTypes) || inSet(zipCodeTypes)) {
    switch (uiOperator) {
      case "equals":
        return "=";
      case "not_equals":
        return "!=";
      case "greater_than":
        return ">";
      case "less_than":
        return "<";
      case "greater_or_equal":
        return ">=";
      case "less_or_equal":
        return "<=";
      case "is_empty":
        return "is_null";
      case "is_not_empty":
        return "is_not_null";
      default:
        return "=";
    }
  }

  if (inSet(scqTypes)) {
    switch (uiOperator) {
      case "is":
        return "=";
      case "is_not":
        return "!=";
      case "is_empty":
        return "is_null";
      case "is_not_empty":
        return "is_not_null";
      default:
        return "=";
    }
  }

  if (inSet(mcqTypes)) {
    switch (uiOperator) {
      case "contains":
        return "ilike";
      case "does_not_contain":
        return "not_ilike";
      case "is_empty":
        return "is_null";
      case "is_not_empty":
        return "is_not_null";
      default:
        return "ilike";
    }
  }

  if (inSet(yesNoTypes)) {
    switch (uiOperator) {
      case "is":
        return "=";
      case "is_not":
        return "!=";
      case "is_empty":
        return "is_null";
      case "is_not_empty":
        return "is_not_null";
      default:
        return "=";
    }
  }

  if (inSet(dateTypes)) {
    switch (uiOperator) {
      case "is":
        return "=";
      case "is_before":
        return "<";
      case "is_after":
        return ">";
      case "is_empty":
        return "is_null";
      case "is_not_empty":
        return "is_not_null";
      default:
        return "=";
    }
  }

  if (inSet(textLikeTypes)) {
    switch (uiOperator) {
      case "contains":
        return "ilike";
      case "does_not_contain":
        return "not_ilike";
      case "equals":
        return "=";
      case "does_not_equal":
        return "!=";
      case "is_empty":
        return "is_null";
      case "is_not_empty":
        return "is_not_null";
      default:
        return "ilike";
    }
  }

  switch (uiOperator) {
    case "contains":
      return "ilike";
    case "does_not_contain":
      return "not_ilike";
    case "equals":
    case "is":
      return "=";
    case "does_not_equal":
    case "is_not":
      return "!=";
    case "is_empty":
      return "is_null";
    case "is_not_empty":
      return "is_not_null";
    default:
      return "ilike";
  }
}

export function getBackendOperatorLabel(opKey: BackendOperatorKey): string {
  switch (opKey) {
    case "ilike":
      return "contains...";
    case "not_ilike":
      return "does not contain...";
    case "=":
      return "is...";
    case "!=":
      return "is not...";
    case "is_null":
      return "is empty";
    case "is_not_null":
      return "is not empty";
    case ">":
      return ">";
    case "<":
      return "<";
    case ">=":
      return "≥";
    case "<=":
      return "≤";
    default:
      return opKey;
  }
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
  const inSet = (set: Array<CellType | string>) =>
    set.some((t) => String(t) === typeKey);

  if (
    inSet([
      CellType.Number,
      CellType.Rating,
      CellType.Slider,
      CellType.ID,
      CellType.AutoNumber,
      CellType.ZipCode,
    ])
  ) {
    switch (backendKey) {
      case "=":
        return "equals";
      case "!=":
        return "not_equals";
      case ">":
        return "greater_than";
      case "<":
        return "less_than";
      case ">=":
        return "greater_or_equal";
      case "<=":
        return "less_or_equal";
      case "is_null":
        return "is_empty";
      case "is_not_null":
        return "is_not_empty";
      default:
        return "equals";
    }
  }

  if (inSet([CellType.SCQ, CellType.DropDown])) {
    switch (backendKey) {
      case "=":
        return "is";
      case "!=":
        return "is_not";
      case "is_null":
        return "is_empty";
      case "is_not_null":
        return "is_not_empty";
      default:
        return "is";
    }
  }

  if (inSet([CellType.MCQ, CellType.List])) {
    switch (backendKey) {
      case "ilike":
        return "contains";
      case "not_ilike":
        return "does_not_contain";
      case "is_null":
        return "is_empty";
      case "is_not_null":
        return "is_not_empty";
      default:
        return "contains";
    }
  }

  if (inSet([CellType.YesNo, CellType.Checkbox])) {
    switch (backendKey) {
      case "=":
        return "is";
      case "!=":
        return "is_not";
      case "is_null":
        return "is_empty";
      case "is_not_null":
        return "is_not_empty";
      default:
        return "is";
    }
  }

  if (inSet([CellType.DateTime, CellType.CreatedTime])) {
    switch (backendKey) {
      case "=":
        return "is";
      case "<":
        return "is_before";
      case ">":
        return "is_after";
      case "is_null":
        return "is_empty";
      case "is_not_null":
        return "is_not_empty";
      default:
        return "is";
    }
  }

  if (
    inSet([
      CellType.String,
      CellType.LongText,
      CellType.Email,
      CellType.Address,
      CellType.PhoneNumber,
      CellType.Formula,
    ])
  ) {
    switch (backendKey) {
      case "ilike":
        return "contains";
      case "not_ilike":
        return "does_not_contain";
      case "=":
        return "equals";
      case "!=":
        return "does_not_equal";
      case "is_null":
        return "is_empty";
      case "is_not_null":
        return "is_not_empty";
      default:
        return "contains";
    }
  }

  switch (backendKey) {
    case "ilike":
      return "contains";
    case "not_ilike":
      return "does_not_contain";
    case "=":
      return "equals";
    case "!=":
      return "does_not_equal";
    case "is_null":
      return "is_empty";
    case "is_not_null":
      return "is_not_empty";
    case ">":
      return "greater_than";
    case "<":
      return "less_than";
    case ">=":
      return "greater_or_equal";
    case "<=":
      return "less_or_equal";
    default:
      return "contains";
  }
}

