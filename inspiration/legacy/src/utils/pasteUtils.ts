// Paste utilities - Inspired by Teable
// Phase 2: Paste functionality - Parse and convert clipboard data to cell updates
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/utils/copyAndPaste.ts
// Reference: teable/apps/nestjs-backend/src/features/selection/selection.service.ts

import { parseClipboardText } from "./clipboardUtils";
import {
	extractTableContent,
	extractHtmlHeader,
	isReferenceSheetHTML,
	parseNormalHtml,
} from "./clipboardHtml";
import type { IColumn, ICell } from "@/types";
import { CellType } from "@/types";
import { ClipboardTypes } from "@/hooks/useClipboard";

/**
 * Parse clipboard data from paste event
 * Handles both TSV (text/plain) and HTML formats
 *
 * @param clipboardData - Clipboard event data
 * @returns Parsed data with cell values and headers
 */
export const parsePasteData = (
	clipboardData: DataTransfer,
): {
	cellValues: unknown[][];
	headers?: IColumn[];
	hasHtml: boolean;
} => {
	const hasHtml = clipboardData.types.includes(ClipboardTypes.html);
	const html = hasHtml ? clipboardData.getData(ClipboardTypes.html) : "";
	const text = clipboardData.types.includes(ClipboardTypes.text)
		? clipboardData.getData(ClipboardTypes.text)
		: "";

	// Extract headers from HTML if available
	const headerResult = extractHtmlHeader(html);
	const headers = headerResult.result;

	// Parse cell values
	let cellValues: unknown[][] = [];

	if (hasHtml) {
		if (isReferenceSheetHTML(html)) {
			// Rich paste from our own system - extract raw values
			const extracted = extractTableContent(html);
			cellValues = extracted || [];
		} else {
			// Normal HTML from Excel/Google Sheets - parse as text
			cellValues = parseNormalHtml(html);
		}
	} else if (text) {
		// TSV format - parse as 2D string array
		cellValues = parseClipboardText(text);
	}

	return {
		cellValues,
		headers,
		hasHtml,
	};
};

/**
 * Strip single quote prefix from JSON strings
 * Google Sheets adds ' prefix to prevent formula interpretation
 * We need to remove it when parsing pasted data
 *
 * @param value - String value that might have ' prefix
 * @returns String without ' prefix
 */
const stripSingleQuotePrefix = (value: string): string => {
	if (value.startsWith("'")) {
		return value.slice(1);
	}
	return value;
};

/**
 * Parse JSON string value, handling single quote prefix
 *
 * @param value - String value that might be JSON
 * @returns Parsed object/array or original string
 */
const parseJsonValue = (value: string): unknown => {
	const stripped = stripSingleQuotePrefix(value);

	// Try to parse as JSON
	if (
		(stripped.startsWith("{") && stripped.endsWith("}")) ||
		(stripped.startsWith("[") && stripped.endsWith("]"))
	) {
		try {
			return JSON.parse(stripped);
		} catch {
			// Not valid JSON, return original
			return value;
		}
	}

	return value;
};

/**
 * Convert paste value to cell data based on column type
 * Handles JSON parsing for complex types (MCQ, PhoneNumber, ZipCode)
 *
 * @param value - Raw paste value (string or object)
 * @param columnType - Target column type
 * @returns Cell data object
 */
export const convertPasteValueToCell = (
	value: unknown,
	columnType: CellType,
): ICell["data"] => {
	// Handle null/undefined
	if (value == null || value === "") {
		return null;
	}

	// If value is already an array, validate and use it (from rich paste)
	if (Array.isArray(value)) {
		// For MCQ type, return array directly
		if (columnType === CellType.MCQ) {
			return value as string[];
		}
		// For other types, fall through to string conversion
	}

	// If value is already an object, validate and use it (from rich paste)
	if (typeof value === "object" && !Array.isArray(value) && value !== null) {
		// For PhoneNumber type, validate structure and return
		if (columnType === CellType.PhoneNumber) {
			const obj = value as Record<string, unknown>;
			if (
				"countryCode" in obj &&
				"countryNumber" in obj &&
				"phoneNumber" in obj
			) {
				return obj as {
					countryCode: string;
					countryNumber: string;
					phoneNumber: string;
				};
			}
		}
		if (columnType === CellType.ZipCode) {
			const obj = value as Record<string, unknown>;
			if ("countryCode" in obj && "zipCode" in obj) {
				return obj as {
					countryCode: string;
					zipCode: string;
				};
			}
		}
		if (columnType === CellType.Currency) {
			const obj = value as Record<string, unknown>;
			if (
				"currencyCode" in obj &&
				"currencySymbol" in obj &&
				"currencyValue" in obj
			) {
				return obj as {
					countryCode: string;
					currencyCode: string;
					currencySymbol: string;
					currencyValue: string;
				};
			}
		}
		// For other types, fall through to string conversion
	}

	// Convert to string for parsing
	const stringValue = String(value);

	switch (columnType) {
		case CellType.String:
			return stringValue;

		case CellType.Number: {
			const num = Number(stringValue);
			return isNaN(num) ? null : num;
		}

		case CellType.MCQ: {
			// Try to parse as JSON array first
			const parsed = parseJsonValue(stringValue);
			if (Array.isArray(parsed)) {
				return parsed;
			}
			// Fallback: treat as comma-separated string
			if (stringValue.includes(",")) {
				return stringValue
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean);
			}
			return stringValue ? [stringValue] : [];
		}

		case CellType.PhoneNumber: {
			// Try to parse as JSON object first
			const parsed = parseJsonValue(stringValue);
			if (
				typeof parsed === "object" &&
				parsed !== null &&
				!Array.isArray(parsed) &&
				"countryCode" in parsed &&
				"countryNumber" in parsed &&
				"phoneNumber" in parsed
			) {
				return parsed as {
					countryCode: string;
					countryNumber: string;
					phoneNumber: string;
				};
			}
			// Fallback: try to parse phone number string format
			// Format: +{countryNumber} {phoneNumber} or just {phoneNumber}
			const phoneMatch = stringValue.match(/^\+?(\d+)\s+(.+)$/);
			if (phoneMatch) {
				return {
					countryCode: "", // Unknown country code
					countryNumber: phoneMatch[1],
					phoneNumber: phoneMatch[2],
				};
			}
			// If no match, return null
			return null;
		}

		case CellType.ZipCode: {
			const parsed = parseJsonValue(stringValue);
			if (
				typeof parsed === "object" &&
				parsed !== null &&
				!Array.isArray(parsed) &&
				"countryCode" in parsed &&
				"zipCode" in parsed
			) {
				return parsed as {
					countryCode: string;
					zipCode: string;
				};
			}
			return stringValue
				? {
						countryCode: "",
						zipCode: stringValue.toUpperCase(),
					}
				: null;
		}
		case CellType.Currency: {
			const parsed = parseJsonValue(stringValue);
			if (
				typeof parsed === "object" &&
				parsed !== null &&
				!Array.isArray(parsed) &&
				"currencyCode" in parsed &&
				"currencySymbol" in parsed &&
				"currencyValue" in parsed
			) {
				return parsed as {
					countryCode: string;
					currencyCode: string;
					currencySymbol: string;
					currencyValue: string;
				};
			}
			const currencyMatch = stringValue.match(
				/^([^\d\s]+)?\s*([\d.,]+)$/u,
			);
			let currencySymbol = "";
			let currencyValue = stringValue;
			if (currencyMatch) {
				currencySymbol = currencyMatch[1]?.trim() ?? "";
				currencyValue = currencyMatch[2]?.replace(/,/g, "") ?? "";
			}
			return {
				countryCode: "",
				currencyCode: "",
				currencySymbol,
				currencyValue,
			};
		}

		default:
			return stringValue;
	}
};

/**
 * Prepare batch cell updates from paste data
 * Maps paste data to target cells based on selection
 *
 * @param pasteData - Parsed paste data
 * @param targetSelection - Target selection (where to paste)
 * @param columns - Column definitions
 * @param records - Current records
 * @returns Array of cell updates: { rowIndex, columnIndex, cell }
 */
export const prepareBatchCellUpdates = (
	pasteData: {
		cellValues: unknown[][];
		headers?: IColumn[];
	},
	targetSelection: {
		startRow: number;
		startCol: number;
	},
	columns: IColumn[],
	records: { id: string; cells: Record<string, ICell> }[],
): Array<{
	rowIndex: number;
	columnIndex: number;
	cell: ICell;
}> => {
	const { cellValues, headers } = pasteData;
	const { startRow, startCol } = targetSelection;

	const updates: Array<{
		rowIndex: number;
		columnIndex: number;
		cell: ICell;
	}> = [];

	// Iterate through paste data
	cellValues.forEach((row, rowOffset) => {
		const targetRowIndex = startRow + rowOffset;

		// Skip if row doesn't exist (would need to create new rows - future enhancement)
		if (targetRowIndex >= records.length) {
			return;
		}

		row.forEach((cellValue, colOffset) => {
			const targetColIndex = startCol + colOffset;

			// Skip if column doesn't exist
			if (targetColIndex >= columns.length) {
				return;
			}

			const column = columns[targetColIndex];
			const record = records[targetRowIndex];

			if (!column || !record) {
				return;
			}

			// Determine source column type (from headers if available, otherwise use target column type)
			const sourceColumnType = headers?.[colOffset]?.type || column.type;

			// Convert paste value to cell data
			const cellData = convertPasteValueToCell(
				cellValue,
				sourceColumnType,
			);

			// Create cell object
			const cell: ICell = {
				type: column.type,
				data: cellData as any,
				displayData: String(cellValue || ""),
			};

			updates.push({
				rowIndex: targetRowIndex,
				columnIndex: targetColIndex,
				cell,
			});
		});
	});

	return updates;
};
