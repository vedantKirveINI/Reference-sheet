export function hasIdentifierChanged(
  currentConfig: any,
  newConfig: any,
): boolean | undefined {
  if (!currentConfig?.identifier || !newConfig?.identifier) {
    return currentConfig?.identifier !== newConfig?.identifier;
  }

  const currentIds = currentConfig.identifier.map((field) => field.field_id);
  const newIds = newConfig.identifier.map((field) => field.field_id);

  // Check if any new IDs are not in current IDs
  const changedIds = newIds.filter((id: number) => !currentIds.includes(id));

  // Return true if there are any changed IDs
  return changedIds.length > 0;
}
