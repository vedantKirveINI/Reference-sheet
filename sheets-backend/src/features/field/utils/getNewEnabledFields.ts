export function getNewEnabledFields(
  currentFields: any[],
  newFields: any[],
): any[] {
  if (!currentFields) return newFields || [];
  if (!newFields) return [];

  // Get existing field names
  const currentFieldNames = new Set(currentFields.map((field) => field.name));

  // Return fields that don't have field_id (new fields to create)
  return newFields.filter((field) => {
    // If field has no field_id, it's a new field to create
    if (!field.field_id) {
      return true;
    }

    // If field name doesn't exist in current fields, it's new
    return !currentFieldNames.has(field.name);
  });
}
