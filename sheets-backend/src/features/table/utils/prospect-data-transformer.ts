/**
 * Transforms prospect result data by extracting the raw object data
 * @param prospectResult - Array of prospect result objects
 * @returns Array of objects containing only the raw data
 */
export function transformProspectData(prospectResult: any[]): any[] {
  if (!Array.isArray(prospectResult)) {
    return [];
  }

  return prospectResult.map((item) => {
    if (item && typeof item === 'object' && item.raw) {
      return {
        ...item.raw,
      };
    }

    // If no raw object, return the item as is
    return item;
  });
}
