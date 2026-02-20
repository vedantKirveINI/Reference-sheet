export function getEnrichmentConfig(
  identifier: any[],
  fieldsToEnrich: any[],
  createdFields: any[],
): any {
  // Map created fields by name for quick lookup
  const createdFieldsMap = new Map(createdFields.map((f: any) => [f.name, f]));

  // Build fieldsToEnrichConfig
  const fieldsToEnrichConfig = fieldsToEnrich.map((field) => {
    const created = createdFieldsMap.get(field.name);
    return {
      ...field,
      field_id: created?.id,
      dbFieldName: created?.dbFieldName,
    };
  });

  return {
    identifier,
    fieldsToEnrich: fieldsToEnrichConfig,
  };
}
