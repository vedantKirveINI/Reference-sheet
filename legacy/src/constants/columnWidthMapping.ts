/**
 * Column Width Mapping
 * Maps field types to default column widths
 * Used when initializing columns if no width is specified in columnMeta
 * 
 */

export const COLUMN_WIDTH_MAPPING: Record<string, number> = {
	// Text based fields
	SHORT_TEXT: 140, // Short Text: 140px
	LONG_TEXT: 240, // Long Text: 240px
	EMAIL: 140, // Email: 140px
	ADDRESS: 140, // Address: 140px

	// Number based fields
	NUMBER: 140, // Number: 140px
	ZIP_CODE: 140, // Zip-code: 140px
	PHONE_NUMBER: 140, // Phone Number: 140px

	// Selection based fields
	YES_NO: 140, // Yes/No: 140px
	SCQ: 140, // Single Choice Question: 140px
	DROP_DOWN: 140, // Dropdown: 140px
	MCQ: 140, // Multiple Choice Question: 140px
	DROP_DOWN_STATIC: 140, // Dropdown Static: 140px

	// Date and time
	DATE: 140, // Date: 140px
	TIME: 140, // Time: 140px
	DATETIME: 140, // DateTime: 140px

	// Other types
	FILE_UPLOAD: 140, // File Upload: 140px
	SIGNATURE: 140, // Signature: 140px
	CURRENCY: 140, // Currency: 140px
	RANKING: 140, // Ranking: 140px
	RATING: 140, // Rating: 140px
	OPINION_SCALE: 140, // Opinion Scale: 140px
	SLIDER: 140, // Slider: 140px
	FORMULA: 140, // Formula: 140px
	ENRICHMENT: 140, // Enrichment: 140px
	LIST: 140, // List: 140px

	// Default width for any unspecified type
	DEFAULT: 150,
};

/**
 * Get default column width for a field type
 * @param fieldType - The field type string
 * @returns Default width for the field type, or 150 if not found
 */
export const getDefaultColumnWidth = (fieldType: string): number => {
	return COLUMN_WIDTH_MAPPING[fieldType] || COLUMN_WIDTH_MAPPING.DEFAULT;
};
