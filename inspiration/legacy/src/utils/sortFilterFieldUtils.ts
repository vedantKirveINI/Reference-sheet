/**
 * Utilities to extract field IDs from sort and filter configurations
 * Used for column highlighting in GridView
 */

/**
 * Extract field IDs from sort configuration
 * @param sort - Sort configuration with sortObjs array
 * @returns Array of field IDs (as strings) that have sort applied
 */
export function getSortedFieldIds(sort: any): string[] {
	if (!sort || !sort.sortObjs || !Array.isArray(sort.sortObjs)) {
		return [];
	}

	return sort.sortObjs
		.map((sortObj: any) => {
			// Handle both fieldId directly on sortObj and nested field.value
			const fieldId = sortObj.fieldId ?? sortObj.field?.value;
			return fieldId != null ? String(fieldId) : null;
		})
		.filter((id): id is string => id !== null);
}

/**
 * Extract field IDs from filter configuration (recursive)
 * @param filter - Filter configuration with childs array
 * @returns Array of unique field IDs (as strings) that have filters applied
 */
export function getFilteredFieldIds(filter: any): string[] {
	if (!filter) {
		return [];
	}

	const fieldIds = new Set<string>();

	/**
	 * Recursively collect field IDs from filter tree
	 * @param node - Current filter node (can be condition or group)
	 */
	function collectFieldIds(node: any): void {
		if (!node) return;

		// If node has childs, it's a group - recurse into children
		if (node.childs && Array.isArray(node.childs)) {
			node.childs.forEach((child: any) => collectFieldIds(child));
		}
		// If node has field, it's a leaf condition - collect the field ID
		else if (node.field != null) {
			fieldIds.add(String(node.field));
		}
	}

	// Start recursion from root childs
	if (filter.childs && Array.isArray(filter.childs)) {
		filter.childs.forEach((child: any) => collectFieldIds(child));
	}

	return Array.from(fieldIds);
}
