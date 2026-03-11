// Column Operations - Inspired by Teable
// Phase 2B: Insert, Duplicate, Edit, Delete Column functionality
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/components/FieldMenu.tsx

import type { ITableData, IColumn, ICell } from "@/types";
import { CellType } from "@/types";

/**
 * Generate a new column ID
 */
const generateColumnId = (): string => {
	return `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Insert columns into table data
 * Inspired by Teable's insertField function
 * Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/components/FieldMenu.tsx (line 135-154)
 *
 * @param tableData - Current table data
 * @param targetIndex - Index where to insert (0-based)
 * @param num - Number of columns to insert
 * @param columnType - Type of column to create (default: String)
 * @returns Updated table data with columns inserted
 */
export const insertColumns = (
	tableData: ITableData,
	targetIndex: number,
	num: number,
	columnType: CellType = CellType.String,
): ITableData => {
	if (num <= 0) {
		return tableData;
	}

	// Clamp targetIndex to valid range
	const clampedIndex = Math.max(
		0,
		Math.min(targetIndex, tableData.columns.length),
	);

	// Create new columns
	const newColumns: IColumn[] = [];
	for (let i = 0; i < num; i++) {
		const columnName = `Column ${tableData.columns.length + i + 1}`;
		newColumns.push({
			id: generateColumnId(),
			name: columnName,
			type: columnType,
			width: 150, // Default width
			isFrozen: false,
			resizable: true,
			minWidth: 50,
		});
	}

	// Insert columns at target index
	const updatedColumns = [
		...tableData.columns.slice(0, clampedIndex),
		...newColumns,
		...tableData.columns.slice(clampedIndex),
	];

	// Add empty cells for new columns in all existing records
	const updatedRecords = tableData.records.map((record) => {
		const newCells: Record<string, ICell> = { ...record.cells };

		// Add empty cells for each new column
		newColumns.forEach((column) => {
			// Create empty cell based on column type
			switch (column.type) {
				case CellType.String:
					newCells[column.id] = {
						type: CellType.String,
						data: "",
						displayData: "",
					};
					break;
				case CellType.Number:
					newCells[column.id] = {
						type: CellType.Number,
						data: null,
						displayData: "",
					};
					break;
				case CellType.MCQ:
					newCells[column.id] = {
						type: CellType.MCQ,
						data: [],
						displayData: "[]",
						options: column.options,
					};
					break;
				case CellType.SCQ:
					newCells[column.id] = {
						type: CellType.SCQ,
						data: null,
						displayData: "",
						options: column.options,
					};
					break;
				case CellType.YesNo:
					newCells[column.id] = {
						type: CellType.YesNo,
						data: null,
						displayData: "",
						options: column.options,
					};
					break;
				case CellType.PhoneNumber:
					newCells[column.id] = {
						type: CellType.PhoneNumber,
						data: null,
						displayData: "",
					};
					break;
				case CellType.ZipCode:
					newCells[column.id] = {
						type: CellType.ZipCode,
						data: null,
						displayData: "",
					};
					break;
				case CellType.Currency:
					newCells[column.id] = {
						type: CellType.Currency,
						data: null,
						displayData: "",
					};
					break;
				case CellType.DateTime:
					newCells[column.id] = {
						type: CellType.DateTime,
						data: null,
						displayData: "",
					};
					break;
				case CellType.CreatedTime:
					newCells[column.id] = {
						type: CellType.CreatedTime,
						data: null,
						displayData: "",
						readOnly: true,
					};
					break;
			}
		});

		return {
			...record,
			cells: newCells,
		};
	});

	return {
		...tableData,
		columns: updatedColumns,
		records: updatedRecords,
	};
};

/**
 * Duplicate a column
 * Creates a copy of the specified column and inserts it after the original
 * Inspired by Teable's duplicateField function
 * Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/components/FieldMenu.tsx (line 180-197)
 *
 * @param tableData - Current table data
 * @param columnId - ID of the column to duplicate
 * @returns Updated table data with duplicated column
 */
export const duplicateColumn = (
	tableData: ITableData,
	columnId: string,
): ITableData => {
	// Find the column to duplicate
	const columnIndex = tableData.columns.findIndex((c) => c.id === columnId);

	if (columnIndex === -1) {
		return tableData;
	}

	const columnToDuplicate = tableData.columns[columnIndex];

	// Create new column with "Copy" suffix
	const newColumn: IColumn = {
		...columnToDuplicate,
		id: generateColumnId(),
		name: `${columnToDuplicate.name} Copy`,
	};

	// Insert the duplicated column after the original (targetIndex = columnIndex + 1)
	const updatedColumns = [
		...tableData.columns.slice(0, columnIndex + 1),
		newColumn,
		...tableData.columns.slice(columnIndex + 1),
	];

	// Copy cell values from original column to new column in all records
	const updatedRecords = tableData.records.map((record) => {
		const originalCell = record.cells[columnId];
		const newCells: Record<string, ICell> = { ...record.cells };

		if (originalCell) {
			// Deep clone the cell
			newCells[newColumn.id] = {
				...originalCell,
			};
		} else {
			// Create empty cell if original doesn't exist
			switch (newColumn.type) {
				case CellType.String:
					newCells[newColumn.id] = {
						type: CellType.String,
						data: "",
						displayData: "",
					};
					break;
				case CellType.Number:
					newCells[newColumn.id] = {
						type: CellType.Number,
						data: null,
						displayData: "",
					};
					break;
				case CellType.MCQ:
					newCells[newColumn.id] = {
						type: CellType.MCQ,
						data: [],
						displayData: "[]",
						options: newColumn.options,
					};
					break;
				case CellType.SCQ:
					newCells[newColumn.id] = {
						type: CellType.SCQ,
						data: null,
						displayData: "",
						options: newColumn.options,
					};
					break;
				case CellType.YesNo:
					newCells[newColumn.id] = {
						type: CellType.YesNo,
						data: null,
						displayData: "",
						options: newColumn.options,
					};
					break;
				case CellType.PhoneNumber:
					newCells[newColumn.id] = {
						type: CellType.PhoneNumber,
						data: null,
						displayData: "",
					};
					break;
				case CellType.ZipCode:
					newCells[newColumn.id] = {
						type: CellType.ZipCode,
						data: null,
						displayData: "",
					};
					break;
				case CellType.Currency:
					newCells[newColumn.id] = {
						type: CellType.Currency,
						data: null,
						displayData: "",
					};
					break;
				case CellType.DateTime:
					newCells[newColumn.id] = {
						type: CellType.DateTime,
						data: null,
						displayData: "",
					};
					break;
				case CellType.CreatedTime:
					newCells[newColumn.id] = {
						type: CellType.CreatedTime,
						data: null,
						displayData: "",
						readOnly: true,
					};
					break;
			}
		}

		return {
			...record,
			cells: newCells,
		};
	});

	return {
		...tableData,
		columns: updatedColumns,
		records: updatedRecords,
	};
};

/**
 * Delete columns from table data
 * Removes columns with the specified IDs and their cells from all records
 * Inspired by Teable's deleteField function
 * Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/components/FieldMenu.tsx (line 359-379)
 *
 * @param tableData - Current table data
 * @param columnIds - Array of column IDs to delete
 * @returns Updated table data with columns removed
 */
export const deleteColumns = (
	tableData: ITableData,
	columnIds: string[],
): ITableData => {
	// Create a Set for faster lookup
	const columnIdsSet = new Set(columnIds);

	// Filter out deleted columns
	const updatedColumns = tableData.columns.filter(
		(column) => !columnIdsSet.has(column.id),
	);

	// Remove cells for deleted columns from all records
	const updatedRecords = tableData.records.map((record) => {
		const newCells: Record<string, ICell> = {};

		// Only keep cells for columns that weren't deleted
		Object.keys(record.cells).forEach((cellColumnId) => {
			if (!columnIdsSet.has(cellColumnId)) {
				newCells[cellColumnId] = record.cells[cellColumnId];
			}
		});

		return {
			...record,
			cells: newCells,
		};
	});

	return {
		...tableData,
		columns: updatedColumns,
		records: updatedRecords,
	};
};

/**
 * Edit column properties
 * Updates the specified column's properties (name, type, width, etc.)
 * This is a placeholder - in a full implementation, this would open a settings dialog
 *
 * @param tableData - Current table data
 * @param columnId - ID of the column to edit
 * @param updates - Partial column properties to update
 * @returns Updated table data with column edited
 */
export const editColumn = (
	tableData: ITableData,
	columnId: string,
	updates: Partial<Omit<IColumn, "id">>,
): ITableData => {
	const columnIndex = tableData.columns.findIndex((c) => c.id === columnId);

	if (columnIndex === -1) {
		return tableData;
	}

	// Update the column
	const updatedColumns = [...tableData.columns];
	updatedColumns[columnIndex] = {
		...updatedColumns[columnIndex],
		...updates,
	};

	return {
		...tableData,
		columns: updatedColumns,
	};
};
