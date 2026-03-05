// Keys that should always be skipped when rendering objects
export const SKIP_KEYS = [
  "__status",
  "__id",
  "__created_by",
  "__last_updated_by",
  "__created_time",
  "__last_modified_time",
  "__version",
];

// Check if a key should be skipped
export const shouldSkipKey = (key) => {
  // Skip if key is in the SKIP_KEYS array
  if (SKIP_KEYS.includes(key)) {
    return true;
  }

  // Skip if key starts with "_row_view"
  if (key.startsWith("_row_view")) {
    return true;
  }

  return false;
};
