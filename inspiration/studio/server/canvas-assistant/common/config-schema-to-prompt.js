/**
 * Convert configSchema string to prompt-friendly format.
 * Input: "label (string, required), placeholder (string, optional)"
 * Output: "{ label, placeholder (optional) }"
 *
 * @param {string} configSchema - Config schema string from type config
 * @returns {string} - Prompt format like "{ key1, key2 (optional) }"
 */
export function configSchemaToPromptFormat(configSchema) {
  if (!configSchema || typeof configSchema !== "string") {
    return "{}";
  }

  const trimmed = configSchema.trim();
  if (!trimmed) {
    return "{}";
  }

  // Split by ", " but avoid splitting inside parentheses or braces
  const tokens = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (c === "(" || c === "{") {
      depth++;
      current += c;
    } else if (c === ")" || c === "}") {
      depth--;
      current += c;
    } else if (c === "," && depth === 0 && trimmed.slice(i, i + 2) === ", ") {
      tokens.push(current.trim());
      current = "";
      i++; // skip the space
    } else {
      current += c;
    }
  }
  if (current.trim()) {
    tokens.push(current.trim());
  }

  const parts = [];
  for (const token of tokens) {
    const keyMatch = token.match(/^([^(]+)/);
    const key = keyMatch ? keyMatch[1].trim() : token;
    if (!key) continue;

    const isOptional = /\([^)]*optional[^)]*\)/.test(token) || /,\s*optional\s*\)/.test(token);

    if (isOptional) {
      parts.push(`${key} (optional)`);
    } else {
      parts.push(key);
    }
  }

  if (parts.length === 0) {
    return "{}";
  }

  return `{ ${parts.join(", ")} }`;
}
