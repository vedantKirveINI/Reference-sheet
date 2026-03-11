import {
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  Mail,
  Link2,
  Phone,
  DollarSign,
  Percent,
  Star,
  Calculator,
  Paperclip,
  Link,
  ListOrdered,
  Clock,
  User,
  FileText,
} from "lucide-react";

export const SHEET_FIELD_TYPES = {
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
  CHECKBOX: "checkbox",
  SELECT: "select",
  EMAIL: "email",
  URL: "url",
  PHONE: "phone",
  CURRENCY: "currency",
  PERCENT: "percent",
  RATING: "rating",
  FORMULA: "formula",
  ATTACHMENT: "attachment",
  LINK: "link",
  AUTONUMBER: "autonumber",
  CREATED_TIME: "created_time",
  MODIFIED_TIME: "modified_time",
  CREATED_BY: "created_by",
  MODIFIED_BY: "modified_by",
};

export const SHEET_TO_FORMULA_TYPE_MAP = {
  text: "string",
  number: "number",
  date: "string",
  checkbox: "boolean",
  select: "string",
  email: "string",
  url: "string",
  phone: "string",
  currency: "number",
  percent: "number",
  rating: "number",
  formula: "any",
  attachment: "array",
  link: "string",
  autonumber: "number",
  created_time: "string",
  modified_time: "string",
  created_by: "string",
  modified_by: "string",
  slider: "number",
  signature: "string",
  mcq: "array",
  scq: "string"
};

const HUMAN_READABLE_TYPE_LABELS = {
  text: "Text",
  number: "Number",
  date: "Date",
  checkbox: "Yes/No",
  select: "Select",
  email: "Email",
  url: "URL",
  phone: "Phone",
  currency: "Currency",
  percent: "Percent",
  rating: "Rating",
  formula: "Formula",
  attachment: "Attachment",
  link: "Link",
  autonumber: "Auto Number",
  created_time: "Created Time",
  modified_time: "Modified Time",
  created_by: "Created By",
  modified_by: "Modified By",
  short_text: "Short Text",
  long_text: "Long Text",
  SHORT_TEXT: "Short Text",
  LONG_TEXT: "Long Text",
  YES_NO: "Yes/No",
  PHONE_NUMBER: "Phone",
  ZIP_CODE: "Zip Code",
  DROP_DOWN: "Dropdown",
  MCQ: "Multiple Choice",
  SCQ: "Single Choice",
  EMAIL: "Email",
  DATE: "Date",
  NUMBER: "Number",
  TIME: "Time",
  CURRENCY: "Currency",
  FILE_PICKER: "File Upload",
  SIGNATURE: "Signature",
  ADDRESS: "Address",
  RATING: "Rating",
  SLIDER: "Slider",
  OPINION_SCALE: "Scale",
  RANKING: "Ranking",
  PICTURE: "Image",
  AUTOCOMPLETE: "Autocomplete",
  KEY_VALUE_TABLE: "Table",
  TERMS_OF_USE: "Terms of Use",
};

const TYPE_ICONS = {
  text: Type,
  string: Type,
  short_text: Type,
  long_text: FileText,
  SHORT_TEXT: Type,
  LONG_TEXT: FileText,
  number: Hash,
  int: Hash,
  NUMBER: Hash,
  date: Calendar,
  DATE: Calendar,
  time: Clock,
  TIME: Clock,
  checkbox: CheckSquare,
  boolean: CheckSquare,
  YES_NO: CheckSquare,
  select: List,
  DROP_DOWN: List,
  MCQ: List,
  SCQ: List,
  email: Mail,
  EMAIL: Mail,
  url: Link2,
  phone: Phone,
  PHONE_NUMBER: Phone,
  currency: DollarSign,
  CURRENCY: DollarSign,
  percent: Percent,
  rating: Star,
  RATING: Star,
  formula: Calculator,
  attachment: Paperclip,
  FILE_PICKER: Paperclip,
  array: Paperclip,
  link: Link,
  autonumber: ListOrdered,
  created_time: Clock,
  modified_time: Clock,
  created_by: User,
  modified_by: User,
  object: FileText,
  any: Type,
  default: Type,
};

const TYPE_BADGE_COLORS = {
  text: "bg-blue-100 text-blue-700",
  string: "bg-blue-100 text-blue-700",
  number: "bg-purple-100 text-purple-700",
  int: "bg-purple-100 text-purple-700",
  date: "bg-amber-100 text-amber-700",
  checkbox: "bg-green-100 text-green-700",
  boolean: "bg-green-100 text-green-700",
  select: "bg-indigo-100 text-indigo-700",
  email: "bg-cyan-100 text-cyan-700",
  url: "bg-teal-100 text-teal-700",
  phone: "bg-orange-100 text-orange-700",
  currency: "bg-emerald-100 text-emerald-700",
  percent: "bg-violet-100 text-violet-700",
  rating: "bg-yellow-100 text-yellow-700",
  formula: "bg-pink-100 text-pink-700",
  attachment: "bg-rose-100 text-rose-700",
  array: "bg-rose-100 text-rose-700",
  link: "bg-sky-100 text-sky-700",
  object: "bg-indigo-100 text-indigo-700",
  any: "bg-gray-100 text-gray-600",
  default: "bg-gray-100 text-gray-700",
};

export function mapSheetTypeToFormulaType(sheetType) {
  if (!sheetType) return "any";

  const normalizedType = String(sheetType).toLowerCase().trim();

  if (SHEET_TO_FORMULA_TYPE_MAP[normalizedType]) {
    return SHEET_TO_FORMULA_TYPE_MAP[normalizedType];
  }

  if (normalizedType.includes("text") || normalizedType.includes("string")) return "string";
  if (normalizedType.includes("number") || normalizedType.includes("int")) return "number";
  if (normalizedType.includes("bool") || normalizedType.includes("check")) return "boolean";
  if (normalizedType.includes("date") || normalizedType.includes("time")) return "string";
  if (normalizedType.includes("email") || normalizedType.includes("url") || normalizedType.includes("phone")) return "string";
  if (normalizedType.includes("array") || normalizedType.includes("list")) return "array";
  if (normalizedType.includes("object") || normalizedType.includes("json")) return "object";
  if (normalizedType.includes("yes_no")) return "string";

  return "any";
}

export function getSheetTypeDisplayName(sheetType) {
  if (!sheetType) return "Text";

  const typeKey = String(sheetType).toLowerCase().trim();

  if (HUMAN_READABLE_TYPE_LABELS[sheetType]) {
    return HUMAN_READABLE_TYPE_LABELS[sheetType];
  }

  if (HUMAN_READABLE_TYPE_LABELS[typeKey]) {
    return HUMAN_READABLE_TYPE_LABELS[typeKey];
  }

  const displayName = typeKey
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return displayName || "Text";
}

export function getSheetTypeBadgeColor(sheetType) {
  if (!sheetType) return TYPE_BADGE_COLORS.default;

  const typeKey = String(sheetType).toLowerCase().trim();

  if (TYPE_BADGE_COLORS[typeKey]) {
    return TYPE_BADGE_COLORS[typeKey];
  }

  const formulaType = mapSheetTypeToFormulaType(sheetType);

  if (TYPE_BADGE_COLORS[formulaType]) {
    return TYPE_BADGE_COLORS[formulaType];
  }

  return TYPE_BADGE_COLORS.default;
}

export function getSheetTypeIcon(sheetType) {
  if (!sheetType) return TYPE_ICONS.default;

  if (TYPE_ICONS[sheetType]) {
    return TYPE_ICONS[sheetType];
  }

  const typeKey = String(sheetType).toLowerCase().trim();

  if (TYPE_ICONS[typeKey]) {
    return TYPE_ICONS[typeKey];
  }

  const formulaType = mapSheetTypeToFormulaType(sheetType);

  if (TYPE_ICONS[formulaType]) {
    return TYPE_ICONS[formulaType];
  }

  return TYPE_ICONS.default;
}

export function getSheetTypeIconColor(sheetType) {
  if (!sheetType) return "text-gray-500";

  const typeKey = String(sheetType).toLowerCase().trim();

  const colorMap = {
    text: "text-blue-600",
    string: "text-blue-600",
    short_text: "text-blue-600",
    long_text: "text-blue-600",
    number: "text-purple-600",
    int: "text-purple-600",
    date: "text-amber-600",
    time: "text-amber-600",
    checkbox: "text-green-600",
    boolean: "text-green-600",
    select: "text-indigo-600",
    email: "text-cyan-600",
    url: "text-teal-600",
    phone: "text-orange-600",
    currency: "text-emerald-600",
    percent: "text-violet-600",
    rating: "text-yellow-600",
    formula: "text-pink-600",
    attachment: "text-rose-600",
    array: "text-rose-600",
    link: "text-sky-600",
    autonumber: "text-purple-600",
    created_time: "text-amber-600",
    modified_time: "text-amber-600",
    created_by: "text-slate-600",
    modified_by: "text-slate-600",
    object: "text-indigo-600",
    any: "text-gray-500",
  };

  if (colorMap[sheetType]) {
    return colorMap[sheetType];
  }

  if (colorMap[typeKey]) {
    return colorMap[typeKey];
  }

  const formulaType = mapSheetTypeToFormulaType(sheetType);
  if (colorMap[formulaType]) {
    return colorMap[formulaType];
  }

  return "text-gray-500";
}

export function isTypeCompatible(sourceType, targetType) {
  if (!targetType || targetType === "any") return true;
  if (!sourceType || sourceType === "any") return true;

  const sourceFormula = mapSheetTypeToFormulaType(sourceType);
  const targetFormula = mapSheetTypeToFormulaType(targetType);

  if (sourceFormula === targetFormula) return true;

  if (targetFormula === "string") return true;

  if (sourceFormula === "number" && targetFormula === "string") return true;
  if (sourceFormula === "boolean" && targetFormula === "string") return true;
  if (sourceFormula === "int" && targetFormula === "number") return true;

  return false;
}

export function getCompatibleFormulaTypes(sheetType) {
  const formulaType = mapSheetTypeToFormulaType(sheetType);

  const compatibilityMap = {
    string: ["string", "any"],
    number: ["number", "int", "any"],
    int: ["int", "number", "any"],
    boolean: ["boolean", "any"],
    array: ["array", "any"],
    object: ["object", "any"],
    any: ["string", "number", "int", "boolean", "array", "object", "any"],
  };

  return compatibilityMap[formulaType] || ["any"];
}

/**
 * Converts application/UI field types to SDK-compatible types.
 * The backend/SDK expects types like STRING, NUMBER, DATE, BOOLEAN, ARRAY, JSON
 * but the application uses types like SHORT_TEXT, LONG_TEXT, EMAIL, PHONE_NUMBER, etc.
 * 
 * @param {string} appType - The application field type (e.g., SHORT_TEXT, EMAIL)
 * @returns {string} - The SDK-compatible type (e.g., STRING, NUMBER)
 */
export function convertApplicationTypeToSDKType(appType) {
  if (!appType) return "STRING";

  const normalizedType = String(appType).toUpperCase().trim();

  const typeMap = {
    SHORT_TEXT: "STRING",
    LONG_TEXT: "TEXT",
    TEXT: "TEXT",
    STRING: "STRING",
    NUMBER: "NUMBER",
    INT: "INT",
    INTEGER: "INT",
    EMAIL: "STRING",
    PHONE_NUMBER: "JSON",
    PHONE: "STRING",
    URL: "STRING",
    CURRENCY: "JSON",
    PERCENT: "NUMBER",
    DATE: "DATE",
    TIME: "JSON",
    DATETIME: "DATE",
    CHECKBOX: "BOOLEAN",
    BOOLEAN: "BOOLEAN",
    YES_NO: "STRING",
    SELECT: "STRING",
    DROP_DOWN: "STRING",
    DROP_DOWN_STATIC: "STRING",
    SCQ: "STRING",
    MCQ: "ARRAY",
    RANKING: "ARRAY",
    RATING: "NUMBER",
    OPINION_SCALE: "NUMBER",
    SLIDER: "NUMBER",
    FILE_PICKER: "ARRAY",
    ATTACHMENT: "ARRAY",
    SIGNATURE: "STRING",
    ADDRESS: "JSON",
    ZIP_CODE: "JSON",
    QUOTE: "STRING",
    AUTOCOMPLETE: "STRING",
    PICTURE: "STRING",
    FORMULA: "ANY",
    ARRAY: "ARRAY",
    JSON: "JSON",
    JSONB: "JSON",
    OBJECT: "JSON",
    ANY: "ANY",
    KEY_VALUE_TABLE: "JSON",
  };

  if (typeMap[normalizedType]) {
    return typeMap[normalizedType];
  }

  if (normalizedType.includes("TEXT") || normalizedType.includes("VARCHAR") || normalizedType.includes("CHAR")) {
    return "STRING";
  }
  if (normalizedType.includes("INT") || normalizedType.includes("SERIAL")) {
    return "INT";
  }
  if (normalizedType.includes("FLOAT") || normalizedType.includes("DOUBLE") || normalizedType.includes("NUMERIC") || normalizedType.includes("REAL")) {
    return "NUMBER";
  }
  if (normalizedType.includes("BOOL")) {
    return "BOOLEAN";
  }
  if (normalizedType.includes("DATE") || normalizedType.includes("TIMESTAMP")) {
    return "DATE";
  }
  if (normalizedType.includes("JSON")) {
    return "JSON";
  }
  if (normalizedType.includes("ARRAY")) {
    return "ARRAY";
  }

  console.warn(`[convertApplicationTypeToSDKType] Unknown type "${appType}", defaulting to STRING`);
  return "STRING";
}
