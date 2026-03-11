/**
 * Removes the first key-value pair from a given object.
 * @param {Object} obj - The input object to remove the first pair from
 * @returns {Object} A new object with the first key-value pair removed
 * @throws {Error} If input is not a non-null object or if object is empty
 */
export function removeFirstKeyValuePair(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new Error("Input must be a non-null object");
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return {};
  }

  const [, ...restEntries] = entries;

  return Object.fromEntries(restEntries);
}
