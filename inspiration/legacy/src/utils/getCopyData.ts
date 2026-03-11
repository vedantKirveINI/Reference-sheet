// Copy data extraction - Inspired by Teable
// Phase 1: Foundation - Extract selected cells to clipboard format
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/utils/getSyncCopyData.ts

import { stringifyClipboardText } from "./clipboardUtils";
import type { ITableData, IColumn, IRecord, ICell } from "@/types";
import type { CombinedSelection } from "@/managers/selection-manager";
import { SelectionRegionType } from "@/types/selection";
import type { IRange } from "@/types/selection";

/**
 * Convert cell value to string for clipboard
 *
 * @param cell - Cell object
 * @returns String representation of cell value
 */
const cellValue2String = (cell: ICell | undefined): string => {
	if (!cell) return "";

	switch (cell.type) {
		case "String":
			return cell.data || "";
		case "Number":
			return cell.data != null ? String(cell.data) : "";
		case "MCQ":
			return Array.isArray(cell.data) ? cell.data.join(", ") : "";
		case "PhoneNumber":
			if (cell.data && typeof cell.data === "object") {
				return `+${cell.data.countryNumber} ${cell.data.phoneNumber}`;
			}
			return "";
		case "ZipCode":
			if (cell.data && typeof cell.data === "object") {
				return cell.data.zipCode || "";
			}
			return "";
	case "Currency":
		if (cell.data && typeof cell.data === "object") {
			const symbol = cell.data.currencySymbol || "";
			const value = cell.data.currencyValue || "";
			return `${symbol} ${value}`.trim();
		}
		return "";
		default:
			return cell.displayData || "";
	}
};

/**
 * Extract copy data from selection
 * Returns both string content (for TSV) and raw content (for HTML)
 *
 * @param params - Selection and table data
 * @returns Copy data with content, rawContent, and headers
 */
export const getCopyData = ({
	tableData,
	selection,
}: {
	tableData: ITableData;
	selection: CombinedSelection;
}): {
	content: string; // TSV string
	rawContent: unknown[][]; // Raw cell values for HTML
	headers: IColumn[]; // Column metadata
} => {
	const { columns, records } = tableData;
	const ranges = selection.serialize();
	const content: string[][] = [];
	const rawContent: unknown[][] = [];
	let headers: IColumn[] = [];

	switch (selection.type) {
		case SelectionRegionType.Cells: {
			// Cell range selection: serialize() returns [[startCol, startRow], [endCol, endRow]]
			// Each IRange is [colIndex, rowIndex] for cell selection
			if (ranges.length < 2) {
				throw new Error("Cell selection must have at least 2 ranges");
			}
			const [startRange, endRange] = ranges as [IRange, IRange];
			const [startColumnIndex, startRowIndex] = startRange as [
				number,
				number,
			];
			const [endColumnIndex, endRowIndex] = endRange as [number, number];

			// Extract headers for selected columns
			headers = columns.slice(startColumnIndex, endColumnIndex + 1);

			// Extract cell values
			for (
				let rowIndex = startRowIndex;
				rowIndex <= endRowIndex;
				rowIndex++
			) {
				const rowContent: string[] = [];
				const rawRowContent: unknown[] = [];

				for (
					let columnIndex = startColumnIndex;
					columnIndex <= endColumnIndex;
					columnIndex++
				) {
					const record = records[rowIndex];
					const column = columns[columnIndex];

					if (record && column) {
						const cell = record.cells[column.id];
						const fieldValue = cellValue2String(cell);
						rowContent.push(fieldValue);

						// Store raw value for HTML serialization
						if (cell) {
							rawRowContent.push(cell.data);
						} else {
							rawRowContent.push(null);
						}
					} else {
						rowContent.push("");
						rawRowContent.push(null);
					}
				}

				content.push(rowContent);
				rawContent.push(rawRowContent);
			}
			break;
		}

		case SelectionRegionType.Rows: {
			// Row selection: [[startRow, endRow], ...]
			headers = columns; // All columns for row selection

			for (let i = 0; i < ranges.length; i++) {
				const [startRowIndex, endRowIndex] = ranges[i] as IRange;

				for (
					let rowIndex = startRowIndex;
					rowIndex <= endRowIndex;
					rowIndex++
				) {
					const record = records[rowIndex];

					const rowContent: string[] = columns.map((column) => {
						if (record) {
							const cell = record.cells[column.id];
							return cellValue2String(cell);
						}
						return "";
					});

					const rawRowContent: unknown[] = columns.map((column) => {
						if (record) {
							const cell = record.cells[column.id];
							return cell ? cell.data : null;
						}
						return null;
					});

					content.push(rowContent);
					rawContent.push(rawRowContent);
				}
			}
			break;
		}

		case SelectionRegionType.Columns: {
			// Column selection: [[startCol, endCol], ...]
			let selectedColumns: IColumn[] = [];

			// Collect all selected columns
			for (let i = 0; i < ranges.length; i++) {
				const [startColIndex, endColIndex] = ranges[i] as IRange;
				selectedColumns = selectedColumns.concat(
					columns.slice(startColIndex, endColIndex + 1),
				);
			}

			headers = selectedColumns;

			// Extract all rows for selected columns
			records.forEach((record) => {
				const rowContent: string[] = selectedColumns.map((column) => {
					const cell = record.cells[column.id];
					return cellValue2String(cell);
				});

				const rawRowContent: unknown[] = selectedColumns.map(
					(column) => {
						const cell = record.cells[column.id];
						return cell ? cell.data : null;
					},
				);

				content.push(rowContent);
				rawContent.push(rawRowContent);
			});
			break;
		}

		default:
			throw new Error("Unsupported selection type");
	}

	const contentString = stringifyClipboardText(content);
	return { content: contentString, headers, rawContent };
};
