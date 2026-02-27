/**
 * Smart SQL escaping utility that automatically detects data type and applies appropriate escaping
 */

/**
 * Automatically escapes any value for safe SQL usage
 * Detects data type and applies the right escaping method
 */
export function escapeSqlValue(value: any): string {
  // Handle null/undefined
  if (value === null || value === undefined) return '';

  // Handle primitive types
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';

  // Handle arrays
  if (Array.isArray(value)) {
    return escapeArrayValue(value);
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    return escapeObjectValue(value);
  }

  // Handle strings and other primitives
  const stringValue = String(value);

  // Check if this looks like a JSON string (starts with { or [ and ends with } or ])
  const isJsonString =
    (stringValue.trim().startsWith('{') && stringValue.trim().endsWith('}')) ||
    (stringValue.trim().startsWith('[') && stringValue.trim().endsWith(']'));

  if (isJsonString) {
    // For JSON strings, only escape single quotes (SQL standard)
    // Don't escape backslashes as they're needed for valid JSON
    return stringValue.replace(/'/g, "''");
  }

  // For regular strings, escape both backslashes and single quotes
  return stringValue
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/'/g, "''"); // Escape single quotes (SQL standard)
}

/**
 * Helper function to escape array values
 */
function escapeArrayValue(array: any[]): string {
  if (array.length === 0) return '[]';

  // Handle array of primitives
  if (
    array.every(
      (item) =>
        typeof item === 'string' ||
        typeof item === 'number' ||
        typeof item === 'boolean',
    )
  ) {
    const escapedItems = array.map((item) => {
      if (typeof item === 'string') {
        return `'${escapeStringValue(item)}'`;
      }
      return item.toString();
    });
    return `[${escapedItems.join(', ')}]`;
  }

  // Handle complex arrays - convert to JSON and escape
  try {
    const jsonString = JSON.stringify(array);
    return escapeStringValue(jsonString);
  } catch (error) {
    // Fallback: convert each item individually
    const escapedItems = array.map((item) => escapeSqlValue(item));
    return `[${escapedItems.join(', ')}]`;
  }
}

/**
 * Helper function to escape object values
 */
function escapeObjectValue(obj: Record<string, any>): string {
  try {
    const jsonString = JSON.stringify(obj);
    return escapeStringValue(jsonString);
  } catch (error) {
    // Fallback: handle as key-value pairs
    const escapedPairs = Object.entries(obj).map(([key, val]) => {
      const escapedKey = escapeStringValue(key);
      const escapedVal = escapeSqlValue(val);
      return `"${escapedKey}": ${escapedVal}`;
    });
    return `{${escapedPairs.join(', ')}}`;
  }
}

/**
 * Helper function to escape string values for JSON
 * Only escapes what's necessary for valid JSON in SQL
 */
function escapeStringValue(str: string): string {
  if (typeof str !== 'string') return escapeSqlValue(str);

  return str
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/'/g, "''"); // Escape single quotes (SQL standard)
}
