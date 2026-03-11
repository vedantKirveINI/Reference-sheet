// Record Operations - Inspired by Teable
// Phase 2A: Delete Records functionality
// Phase 2B: Insert and Duplicate Records functionality
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/hooks/useSelectionOperation.ts

import type { ITableData, IRecord, IColumn, ICell } from "@/types";
import { CellType, RowHeightLevel } from "@/types";

/**
 * Delete records from table data
 * Removes records with the specified IDs and updates row headers accordingly
 *
 * @param tableData - Current table data
 * @param recordIds - Array of record IDs to delete
 * @returns Updated table data with records removed
 */
export const deleteRecords = (
	tableData: ITableData,
	recordIds: string[],
): ITableData => {
	// Create a Set for faster lookup
	const recordIdsSet = new Set(recordIds);

	// Filter out deleted records
	const newRecords = tableData.records.filter(
		(record) => !recordIdsSet.has(record.id),
	);

	// Update row headers - remove deleted rows and reindex remaining ones
	const newRowHeaders = tableData.rowHeaders
		.filter((header) => !recordIdsSet.has(header.id))
		.map((header, index) => ({
			...header,
			rowIndex: index,
		}));

	return {
		...tableData,
		records: newRecords,
		rowHeaders: newRowHeaders,
	};
};

/**
 * Generate a new record ID
 */
const generateRecordId = (): string => {
	return `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a new row header ID
 */
const generateRowHeaderId = (): string => {
	return `row_header_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create an empty record with default cell values
 * Inspired by Teable's generateRecord function
 * Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.tsx (line 567-611)
 */
const normalizeYesNoValue = (value: unknown): "Yes" | "No" | "Other" | null => {
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (/^yes$/i.test(trimmed)) return "Yes";
		if (/^no$/i.test(trimmed)) return "No";
		if (trimmed) return "Other";
	} else if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}
	return null;
};

const createEmptyRecord = (
	columns: IColumn[],
	fieldValueMap?: { [columnId: string]: unknown },
): IRecord => {
	const cells: Record<string, ICell> = {};

	columns.forEach((column) => {
		// If fieldValueMap is provided, use those values (for duplicate/insert with values)
		if (fieldValueMap && fieldValueMap[column.id] !== undefined) {
			const value = fieldValueMap[column.id];
			// Create cell based on column type
			switch (column.type) {
				case CellType.String:
					cells[column.id] = {
						type: CellType.String,
						data: typeof value === "string" ? value : "",
						displayData: typeof value === "string" ? value : "",
					};
					break;
				case CellType.Number:
					cells[column.id] = {
						type: CellType.Number,
						data: typeof value === "number" ? value : null,
						displayData:
							typeof value === "number" ? value.toString() : "",
					};
					break;
				case CellType.MCQ:
					cells[column.id] = {
						type: CellType.MCQ,
						data: Array.isArray(value) ? value : [],
						displayData: Array.isArray(value)
							? JSON.stringify(value)
							: "[]",
						options: column.options,
					};
					break;
				case CellType.SCQ:
					cells[column.id] = {
						type: CellType.SCQ,
						data: typeof value === "string" ? value : null,
						displayData: typeof value === "string" ? value : "",
						options: column.options,
					};
					break;
				case CellType.YesNo:
					const normalizedYesNo = normalizeYesNoValue(value);
					cells[column.id] = {
						type: CellType.YesNo,
						data: normalizedYesNo,
						displayData: normalizedYesNo || "",
						options: column.options,
					};
					break;
				case CellType.PhoneNumber:
					cells[column.id] = {
						type: CellType.PhoneNumber,
						data:
							value &&
							typeof value === "object" &&
							!Array.isArray(value) &&
							"countryCode" in value
								? (value as {
										countryCode: string;
										countryNumber: string;
										phoneNumber: string;
									})
								: null,
						displayData:
							value &&
							typeof value === "object" &&
							!Array.isArray(value) &&
							"countryCode" in value
								? JSON.stringify(value)
								: "",
					};
					break;
				case CellType.ZipCode:
					cells[column.id] = {
						type: CellType.ZipCode,
						data:
							value &&
							typeof value === "object" &&
							!Array.isArray(value) &&
							"countryCode" in value
								? (value as {
										countryCode: string;
										zipCode: string;
									})
								: null,
						displayData:
							value &&
							typeof value === "object" &&
							!Array.isArray(value) &&
							"countryCode" in value
								? JSON.stringify(value)
								: "",
					};
					break;
				case CellType.Currency:
					cells[column.id] = {
						type: CellType.Currency,
						data:
							value &&
							typeof value === "object" &&
							!Array.isArray(value) &&
							"currencyCode" in value
								? (value as {
										countryCode: string;
										currencyCode: string;
										currencySymbol: string;
										currencyValue: string;
									})
								: null,
						displayData:
							value &&
							typeof value === "object" &&
							!Array.isArray(value) &&
							"currencyCode" in value
								? JSON.stringify(value)
								: "",
					};
					break;
				case CellType.DateTime:
					cells[column.id] = {
						type: CellType.DateTime,
						data: typeof value === "string" ? value : null,
						displayData: typeof value === "string" ? value : "",
					};
					break;
				case CellType.CreatedTime:
					cells[column.id] = {
						type: CellType.CreatedTime,
						data: typeof value === "string" ? value : null,
						displayData: typeof value === "string" ? value : "",
						readOnly: true,
					};
					break;
			}
		} else {
			// Create empty cell based on column type
			switch (column.type) {
				case CellType.String:
					cells[column.id] = {
						type: CellType.String,
						data: "",
						displayData: "",
					};
					break;
				case CellType.Number:
					cells[column.id] = {
						type: CellType.Number,
						data: null,
						displayData: "",
					};
					break;
				case CellType.MCQ:
					cells[column.id] = {
						type: CellType.MCQ,
						data: [],
						displayData: "[]",
						options: column.options,
					};
					break;
				case CellType.SCQ:
					cells[column.id] = {
						type: CellType.SCQ,
						data: null,
						displayData: "",
						options: column.options,
					};
					break;
				case CellType.YesNo:
					cells[column.id] = {
						type: CellType.YesNo,
						data: null,
						displayData: "",
						options: column.options,
					};
					break;
				case CellType.PhoneNumber:
					cells[column.id] = {
						type: CellType.PhoneNumber,
						data: null,
						displayData: "",
					};
					break;
				case CellType.ZipCode:
					cells[column.id] = {
						type: CellType.ZipCode,
						data: null,
						displayData: "",
					};
					break;
				case CellType.Currency:
					cells[column.id] = {
						type: CellType.Currency,
						data: null,
						displayData: "",
					};
					break;
				case CellType.DateTime:
					cells[column.id] = {
						type: CellType.DateTime,
						data: null,
						displayData: "",
					};
					break;
				case CellType.CreatedTime:
					cells[column.id] = {
						type: CellType.CreatedTime,
						data: null,
						displayData: "",
						readOnly: true,
					};
					break;
			}
		}
	});

	return {
		id: generateRecordId(),
		cells,
	};
};

/**
 * Insert records into table data
 * Inspired by Teable's generateRecord function
 * Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.tsx (line 567-611)
 *
 * @param tableData - Current table data
 * @param targetIndex - Index where to insert (0-based)
 * @param num - Number of records to insert
 * @param fieldValueMap - Optional map of column IDs to values (for duplicating values)
 * @returns Updated table data with records inserted
 */
export const insertRecords = (
	tableData: ITableData,
	targetIndex: number,
	num: number,
	fieldValueMap?: { [columnId: string]: unknown },
): ITableData => {
	if (num <= 0) {
		return tableData;
	}

	// Clamp targetIndex to valid range
	const clampedIndex = Math.max(
		0,
		Math.min(targetIndex, tableData.records.length),
	);

	// Create new records
	const newRecords: IRecord[] = [];
	for (let i = 0; i < num; i++) {
		newRecords.push(createEmptyRecord(tableData.columns, fieldValueMap));
	}

	// Insert records at target index
	const updatedRecords = [
		...tableData.records.slice(0, clampedIndex),
		...newRecords,
		...tableData.records.slice(clampedIndex),
	];

	// Create new row headers for inserted records
	const newRowHeaders = newRecords.map((_record, index) => ({
		id: generateRowHeaderId(),
		rowIndex: clampedIndex + index,
		heightLevel: RowHeightLevel.Short, // Default to short height
		displayIndex: clampedIndex + index + 1, // 1-based display index
	}));

	// Update existing row headers after insertion point
	const updatedRowHeaders = [
		...tableData.rowHeaders.slice(0, clampedIndex),
		...newRowHeaders,
		...tableData.rowHeaders.slice(clampedIndex).map((header, index) => ({
			...header,
			rowIndex: clampedIndex + num + index,
			displayIndex: clampedIndex + num + index + 1,
		})),
	];

	return {
		...tableData,
		records: updatedRecords,
		rowHeaders: updatedRowHeaders,
	};
};

/**
 * Duplicate a record
 * Creates a copy of the specified record and inserts it after the original
 * Inspired by Teable's duplicateRecord function
 * Reference: teable/packages/sdk/src/hooks/use-record-operations.ts (line 40-50)
 *
 * @param tableData - Current table data
 * @param recordId - ID of the record to duplicate
 * @returns Updated table data with duplicated record
 */
export const duplicateRecord = (
	tableData: ITableData,
	recordId: string,
): ITableData => {
	// Find the record to duplicate
	const recordIndex = tableData.records.findIndex((r) => r.id === recordId);

	if (recordIndex === -1) {
		return tableData;
	}

	const recordToDuplicate = tableData.records[recordIndex];

	// Extract field values from the record
	const fieldValueMap: { [columnId: string]: unknown } = {};
	tableData.columns.forEach((column) => {
		const cell = recordToDuplicate.cells[column.id];
		if (cell) {
			fieldValueMap[column.id] = cell.data;
		}
	});

	// Insert the duplicated record after the original (targetIndex = recordIndex + 1)
	return insertRecords(tableData, recordIndex + 1, 1, fieldValueMap);
};
