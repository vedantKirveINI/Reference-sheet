import { ROW_TYPES, VARIABLE_REGEX } from "./constants";

export function detectType(value) {
  if (!value || typeof value !== "string") return ROW_TYPES.TEXT;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return ROW_TYPES.JSON;
    } catch {
      return ROW_TYPES.TEXT;
    }
  }
  return ROW_TYPES.TEXT;
}

export function generateId() {
  return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function hasVariables(value) {
  if (!value || typeof value !== "string") return false;
  return VARIABLE_REGEX.test(value);
}

export function parseVariables(value) {
  if (!value || typeof value !== "string") return [];
  const matches = [];
  let match;
  const regex = new RegExp(VARIABLE_REGEX.source, "g");
  while ((match = regex.exec(value)) !== null) {
    matches.push({
      variable: match[1],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return matches;
}

export function parseBulkImport(text) {
  if (!text || typeof text !== "string") return [];
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          let key = item?.key ?? item?.name ?? "";
          let value = item?.value;
          if (key === "" && value === undefined && item && typeof item === "object" && !Array.isArray(item)) {
            const entry = Object.entries(item)[0];
            if (entry) {
              key = entry[0];
              value = entry[1];
            }
          }
          const valueStr = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
          return {
            key: String(key),
            value: valueStr,
            enabled: item?.enabled !== false,
            type: detectType(valueStr),
            description: item?.description ?? "",
          };
        });
      } else if (typeof parsed === "object") {
        return Object.entries(parsed).map(([key, value]) => ({
          key,
          value: typeof value === "object" ? JSON.stringify(value) : String(value),
          enabled: true,
          type: detectType(typeof value === "object" ? JSON.stringify(value) : String(value)),
          description: "",
        }));
      }
    } catch {
      // Fall through to line-by-line parsing
    }
  }
  return text.split("\n").filter(Boolean).map((line) => {
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    return {
      key: key.trim(),
      value,
      enabled: true,
      type: detectType(value),
      description: "",
    };
  });
}

export function formatForExport(rows) {
  return rows
    .filter((row) => row.key || row.value)
    .map(({ key, value, enabled, type, description }) => ({
      key,
      value,
      enabled,
      type,
      description,
    }));
}
