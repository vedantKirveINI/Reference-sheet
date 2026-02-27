/**
 * Column Meta Utilities
 * Helper functions for parsing and working with columnMeta JSON
 * 
 * Reference: sheets/src/pages/WelcomeScreen/components/Handsontable/utils/helper.js
 */

/**
 * Parse columnMeta JSON string into an object
 * @param columnMeta - JSON string from view.columnMeta
 * @returns Parsed columnMeta object, or empty object if invalid
 */
export const parseColumnMeta = (columnMeta: string | null | undefined): Record<string, any> => {
	if (!columnMeta) {
		return {};
	}

	try {
		const parsed = JSON.parse(columnMeta);
		return parsed || {};
	} catch {
		return {};
	}
};

/**
 * Get column width from columnMeta with fallbacks
 * Priority: columnMeta width > type-based mapping > default
 * 
 * @param fieldId - The field ID (rawId)
 * @param fieldType - The field type (e.g., "SHORT_TEXT")
 * @param parsedColumnMeta - Parsed columnMeta object
 * @param columnWidthMapping - Type-based width mapping
 * @returns Column width in pixels
 */
export const getColumnWidth = (
	fieldId: number,
	fieldType: string,
	parsedColumnMeta: Record<string, any>,
	columnWidthMapping: Record<string, number>,
): number => {

	// 1. Try to get width from columnMeta (highest priority)
	// Note: JSON keys are always strings, so convert fieldId to string for lookup
	const fieldIdKey = String(fieldId);
	const metaWidth = parsedColumnMeta[fieldIdKey]?.width;
	if (metaWidth && typeof metaWidth === "number" && metaWidth > 0) {
		return metaWidth;
	}

	// 2. Try to get width from type-based mapping
	const typeWidth = columnWidthMapping[fieldType];

	if (typeWidth) {
		return typeWidth;
	}

	// 3. Default width
	return columnWidthMapping.DEFAULT || 150;
};

/**
 * Get column hidden state from columnMeta
 * @param fieldId - The field ID (rawId)
 * @param parsedColumnMeta - Parsed columnMeta object
 * @returns true if field is hidden, false otherwise
 */
export const getColumnHiddenState = (
	fieldId: string | number,
	parsedColumnMeta: Record<string, any>,
): boolean => {
	const fieldIdKey = String(fieldId);
	return parsedColumnMeta[fieldIdKey]?.is_hidden === true;
};
