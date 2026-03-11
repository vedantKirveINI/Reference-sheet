// HTML clipboard utilities - Inspired by Teable
// Phase 1: Foundation - HTML serialization for rich paste
// Reference: teable/apps/nextjs-app/src/features/app/utils/clipboard.ts

import { parseClipboardText } from "./clipboardUtils";
import type { IColumn } from "@/types";
import { CellType } from "@/types";

const referenceSheetHtmlMarker = "data-reference-sheet-html-marker";
const referenceSheetHeader = "data-reference-sheet-html-header";

const lineTag =
	'<br data-reference-sheet-line-tag="1" style="mso-data-placement:same-cell;">';

/**
 * Serialize TSV data and headers to HTML table format
 * Used for rich paste (preserves column metadata)
 *
 * @param data - TSV string content
 * @param headers - Column metadata array
 * @returns HTML string with table
 */
export const serializeHtml = (data: string, headers: IColumn[]): string => {
	const tableData = parseClipboardText(data);
	const bodyContent = tableData
		.map((row) => {
			return `<tr>${row
				.map((cell, index) => {
					const header = headers[index];
					// Handle multi-line text (similar to Teable's LongText)
					if (header && cell.includes("\n")) {
						return `<td>${cell.replace(/\n/g, lineTag)}</td>`;
					}
					return `<td>${cell}</td>`;
				})
				.join("")}</tr>`;
		})
		.join("");

	return `<meta charset="utf-8"><table ${referenceSheetHtmlMarker}="1" ${referenceSheetHeader}="${encodeURIComponent(JSON.stringify(headers))}"><tbody>${bodyContent}</tbody></table>`;
};

/**
 * Serialize cell values and headers to HTML table format
 * Used for rich paste with actual cell values (not just display strings)
 *
 * @param data - 2D array of cell values (raw data)
 * @param headers - Column metadata array
 * @returns HTML string with table
 */
export const serializeCellValueHtml = (
	data: unknown[][],
	headers: IColumn[],
): string => {
	const bodyContent = data
		.map((row) => {
			return `<tr>${row
				.map((cell, index) => {
					const header = headers[index];
					if (!header) return "<td></td>";

					const cellValue = cell == null ? null : cell;
					const cellValueStr = cellValue2String(
						cellValue,
						header.type,
					);

					// Store raw value in data attribute for complex types
					if (
						header.type !== CellType.String &&
						header.type !== CellType.Number
					) {
						return `<td data-reference-sheet-cell-value="${encodeURIComponent(JSON.stringify(cellValue))}">${cellValueStr.replace(/\n/g, lineTag)}</td>`;
					}

					// Handle multi-line text
					if (cellValueStr.includes("\n")) {
						return `<td data-reference-sheet-cell-value="${encodeURIComponent(JSON.stringify(cellValue))}">${cellValueStr.replace(/\n/g, lineTag)}</td>`;
					}

					return `<td>${cellValueStr}</td>`;
				})
				.join("")}</tr>`;
		})
		.join("");

	return `<meta charset="utf-8"><table ${referenceSheetHtmlMarker}="1" ${referenceSheetHeader}="${encodeURIComponent(JSON.stringify(headers))}"><tbody>${bodyContent}</tbody></table>`;
};

/**
 * Convert cell value to string representation
 *
 * @param value - Cell value (any type)
 * @param cellType - Type of the cell
 * @returns String representation
 */
const cellValue2String = (value: unknown, cellType: CellType): string => {
	if (value == null) return "";

	switch (cellType) {
		case CellType.String:
			return String(value);
		case CellType.Number:
			return String(value);
		case CellType.MCQ:
			return Array.isArray(value) ? value.join(", ") : String(value);
		case CellType.PhoneNumber:
			if (typeof value === "object" && value !== null) {
				const phone = value as {
					countryCode: string;
					countryNumber: string;
					phoneNumber: string;
				};
				return `+${phone.countryNumber} ${phone.phoneNumber}`;
			}
			return String(value);
		case CellType.ZipCode:
			if (typeof value === "object" && value !== null) {
				const zip = value as { countryCode: string; zipCode: string };
				return zip.zipCode || "";
			}
			return String(value);
	case CellType.Currency:
		if (typeof value === "object" && value !== null) {
			const currency = value as {
				currencySymbol?: string;
				currencyValue?: string;
			};
			return `${currency.currencySymbol ?? ""} ${
				currency.currencyValue ?? ""
			}`.trim();
		}
		return String(value);
		default:
			return String(value);
	}
};

/**
 * Check if HTML string is from Reference Sheet (has our marker)
 *
 * @param html - HTML string to check
 * @returns true if HTML is from Reference Sheet
 */
export const isReferenceSheetHTML = (html: string): boolean => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	const table = doc.querySelector("table");
	return Boolean(table?.getAttribute(referenceSheetHtmlMarker));
};

/**
 * Extract column metadata from HTML table
 *
 * @param html - HTML string
 * @returns Object with headers or error
 */
export const extractHtmlHeader = (
	html?: string,
): {
	result?: IColumn[];
	error?: string;
} => {
	if (!html || !isReferenceSheetHTML(html)) {
		return { result: undefined };
	}

	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	const table = doc.querySelector("table");
	const headerStr = table?.getAttribute(referenceSheetHeader);

	if (!headerStr) {
		return { result: undefined };
	}

	try {
		const headers = JSON.parse(decodeURIComponent(headerStr)) as IColumn[];
		return { result: headers };
	} catch (error) {
		return {
			result: undefined,
			error:
				error instanceof Error
					? error.message
					: "Failed to parse headers",
		};
	}
};

/**
 * Extract table content from Reference Sheet HTML
 * Returns raw cell values if available, otherwise text content
 *
 * @param html - HTML string
 * @returns 2D array of cell values or undefined
 */
export const extractTableContent = (html: string): unknown[][] | undefined => {
	if (!html || !isReferenceSheetHTML(html)) {
		return undefined;
	}

	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	const table = doc.querySelector("table");

	if (!table) {
		return undefined;
	}

	const rows = table.querySelectorAll("tr");
	const content: unknown[][] = [];

	rows.forEach((row) => {
		const rowData: unknown[] = [];
		const cells = row.querySelectorAll("td");

		cells.forEach((cell) => {
			const cellText = cell.textContent || "";
			const cellValue = cell.getAttribute(
				"data-reference-sheet-cell-value",
			);

			if (!cellValue) {
				// No raw value, use text content
				rowData.push(cellText);
				return;
			}

			// Parse raw value from data attribute
			try {
				const cellValueObj = JSON.parse(decodeURIComponent(cellValue));
				rowData.push(cellValueObj);
			} catch {
				// Fallback to text if parsing fails
				rowData.push(cellText);
			}
		});

		if (rowData.length > 0) {
			content.push(rowData);
		}
	});

	return content;
};

/**
 * Parse normal HTML table (from Excel, Google Sheets, etc.)
 * Extracts text content from table cells
 *
 * @param html - HTML string
 * @returns 2D array of strings
 */
export const parseNormalHtml = (html: string): string[][] => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	const table = doc.querySelector("table");

	if (!table) {
		// No table, return body text as single cell
		return [[doc.body.textContent || ""]];
	}

	const rows = Array.from(table.rows);
	return rows.map((row) => {
		const cells = Array.from(row.cells);
		return cells.map((cell) => cell.textContent || "");
	});
};
