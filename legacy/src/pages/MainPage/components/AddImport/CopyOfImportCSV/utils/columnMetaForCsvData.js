function getDynamicColumnConfig(columnType, sampleData) {
	if (!Array.isArray(sampleData) || sampleData.length === 0) {
		return { width: 150, wordWrap: false }; // Fallback
	}

	// Find longest string length in sample
	const maxLength = sampleData.reduce((max, value) => {
		const len = String(value ?? "").length;
		return Math.max(max, len);
	}, 0);

	// Estimate width: assume 8px per character as a baseline (adjustable), with a 40px buffer
	const charWidth = 4;
	let width = maxLength * charWidth + 20;

	// Enforce some min/max caps (optional)
	const MIN_WIDTH = 120;
	const MAX_WIDTH = 800;
	width = Math.max(MIN_WIDTH, Math.min(width, MAX_WIDTH));

	// Determine word wrap
	let wordWrap = false;
	if (columnType === "LONG_TEXT" && maxLength > 100) {
		wordWrap = true;
	}

	return { width: width, text_wrap: wordWrap ? "wrap" : "ellipses" };
}

/**
 * @param {string[][]} rows - 2D array of strings; first row is headers, rest are data
 * @param {string[]} columnTypes - Array of types, one per column index (e.g. ["SHORT_TEXT", "EMAIL", ...])
 * @returns {Array<{ width: number, wordWrap: boolean }>}
 */
export function getColumnConfigsFromArray(rows, columnTypes) {
	if (!Array.isArray(rows) || rows.length < 2) return [];

	const dataRows = rows.slice(1); // skip header
	const numColumns = rows[0].length;

	const columnConfigs = [];

	for (let colIndex = 0; colIndex < numColumns; colIndex++) {
		const columnType = columnTypes[colIndex] || "DEFAULT";

		const sampleData = dataRows.map((row) => {
			const val = row[colIndex];
			return typeof val === "string" ? val : "";
		});

		columnConfigs[colIndex] = getDynamicColumnConfig(
			columnType,
			sampleData,
		);
	}

	return columnConfigs;
}
