// Phase 1: Helper functions for group operations
// Reference: teable/packages/sdk/src/components/grid-enhancements/hooks/use-grid-collapsed-group.ts

/**
 * Generate unique group ID based on field ID and values
 * Reference: Teable's group ID generation logic
 */
export const generateGroupId = (fieldId: number, values: unknown[]): string => {
	const flagString = `${fieldId}_${values.join("_")}`;
	// Simple hash function (in production, use a proper hash library)
	let hash = 0;
	for (let i = 0; i < flagString.length; i++) {
		const char = flagString.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return String(Math.abs(hash));
};

/**
 * Check if a group is collapsed
 */
export const isGroupCollapsed = (
	groupId: string,
	collapsedGroupIds: Set<string> | null,
): boolean => {
	if (!collapsedGroupIds) return false;
	return collapsedGroupIds.has(groupId);
};

/**
 * Toggle group collapse state
 */
export const toggleGroupCollapse = (
	groupId: string,
	collapsedGroupIds: Set<string>,
): Set<string> => {
	const newSet = new Set(collapsedGroupIds);
	if (newSet.has(groupId)) {
		newSet.delete(groupId);
	} else {
		newSet.add(groupId);
	}
	return newSet;
};

/**
 * Format group header text in Airtable style: "Field Name: Value"
 * @param fieldName - The name of the grouped field
 * @param value - The value of the group (will be converted to string)
 * @returns Formatted string like "Field Name: Value"
 */
export const formatGroupHeaderText = (
	fieldName: string,
	value: unknown,
): string => {
	const valueStr =
		value === null || value === undefined
			? "Empty"
			: String(value);
	return `${fieldName}: ${valueStr}`;
};
