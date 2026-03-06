export const DB_TO_FORMULA_TYPE_MAP = {
  INTEGER: "int",
  BIGINT: "int",
  SMALLINT: "int",
  INT: "int",
  INT4: "int",
  INT8: "int",
  SERIAL: "int",
  BIGSERIAL: "int",
  
  NUMERIC: "number",
  DECIMAL: "number",
  FLOAT: "number",
  FLOAT4: "number",
  FLOAT8: "number",
  REAL: "number",
  DOUBLE: "number",
  "DOUBLE PRECISION": "number",
  NUMBER: "number",
  
  VARCHAR: "string",
  TEXT: "string",
  CHAR: "string",
  CHARACTER: "string",
  "CHARACTER VARYING": "string",
  STRING: "string",
  UUID: "string",
  
  BOOLEAN: "boolean",
  BOOL: "boolean",
  
  JSON: "object",
  JSONB: "object",
  
  ARRAY: "array",
  "INTEGER[]": "array",
  "TEXT[]": "array",
  "VARCHAR[]": "array",
  
  DATE: "string",
  TIME: "string",
  TIMESTAMP: "string",
  TIMESTAMPTZ: "string",
  "TIMESTAMP WITH TIME ZONE": "string",
  "TIMESTAMP WITHOUT TIME ZONE": "string",
  "TIME WITH TIME ZONE": "string",
  "TIME WITHOUT TIME ZONE": "string",
  DATETIME: "string",
  INTERVAL: "string",
  
  BYTEA: "string",
  BINARY: "string",
  BLOB: "string",
  VARBINARY: "string",
};

export function mapDbTypeToFormulaType(dbType) {
  if (!dbType) return "any";
  
  const normalizedType = String(dbType).toUpperCase().trim();
  
  if (DB_TO_FORMULA_TYPE_MAP[normalizedType]) {
    return DB_TO_FORMULA_TYPE_MAP[normalizedType];
  }
  
  if (normalizedType.includes("INT")) return "int";
  if (normalizedType.includes("CHAR") || normalizedType.includes("TEXT")) return "string";
  if (normalizedType.includes("FLOAT") || normalizedType.includes("NUMERIC") || normalizedType.includes("DECIMAL")) return "number";
  if (normalizedType.includes("BOOL")) return "boolean";
  if (normalizedType.includes("JSON")) return "object";
  if (normalizedType.includes("[]") || normalizedType.includes("ARRAY")) return "array";
  if (normalizedType.includes("DATE") || normalizedType.includes("TIME") || normalizedType.includes("TIMESTAMP")) return "string";
  if (normalizedType.includes("BINARY") || normalizedType.includes("BYTE") || normalizedType.includes("BLOB")) return "string";
  
  return "any";
}

export function getTypeDisplayName(dbType) {
  const formulaType = mapDbTypeToFormulaType(dbType);
  const displayNames = {
    int: "Integer",
    number: "Number",
    string: "Text",
    boolean: "Boolean",
    object: "Object",
    array: "Array",
    any: "Any",
  };
  return displayNames[formulaType] || dbType || "Any";
}

export function getTypeBadgeColor(formulaType) {
  const colors = {
    int: "bg-blue-100 text-blue-700",
    number: "bg-purple-100 text-purple-700",
    string: "bg-green-100 text-green-700",
    boolean: "bg-amber-100 text-amber-700",
    object: "bg-indigo-100 text-indigo-700",
    array: "bg-pink-100 text-pink-700",
    any: "bg-gray-100 text-gray-600",
  };
  return colors[formulaType] || colors.any;
}
