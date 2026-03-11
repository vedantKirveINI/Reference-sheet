export const ROW_TYPES = {
  TEXT: "text",
  JSON: "json",
  FILE: "file",
};

export const TYPE_LABELS = {
  [ROW_TYPES.TEXT]: "Text",
  [ROW_TYPES.JSON]: "JSON",
  [ROW_TYPES.FILE]: "File",
};

export const DEFAULT_ROW = {
  key: "",
  value: "",
  enabled: true,
  type: ROW_TYPES.TEXT,
  description: "",
};

export const VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;
