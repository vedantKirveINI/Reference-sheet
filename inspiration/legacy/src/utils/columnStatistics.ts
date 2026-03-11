import type { IColumn, IRecord, ICell, IColumnStatistics } from "@/types";
import { CellType } from "@/types";
import type { CombinedSelection } from "@/managers/selection-manager";
import { SelectionRegionType } from "@/types/selection";

type StatisticCalculator = (values: number[]) => number;

const STATISTIC_CALCULATORS: Record<
	keyof Omit<IColumnStatistics[string], "count">,
	StatisticCalculator
> = {
	sum: (values) => values.reduce((acc, val) => acc + val, 0),
	avg: (values) => {
		const sum = values.reduce((acc, val) => acc + val, 0);
		return sum / values.length;
	},
	min: (values) => Math.min(...values),
	max: (values) => Math.max(...values),
};

const DEFAULT_STATISTICS = {
	sum: 0,
	count: 0,
	avg: 0,
	min: 0,
	max: 0,
} as const;

export const getNumberCellValue = (cell: ICell | undefined): number | null => {
	if (!cell || cell.type !== CellType.Number) return null;

	const value = (cell as any).data;
	if (value === null || value === undefined) return null;

	const numValue = typeof value === "number" ? value : Number(value);
	if (isNaN(numValue) || !isFinite(numValue)) return null;

	return numValue;
};

const extractColumnValues = (
	records: IRecord[],
	columnId: string,
	selectedRowIndices?: Set<number>,
): number[] => {
	return records
		.map((record, index) => {
			// If selectedRowIndices is provided, only include selected rows
			if (selectedRowIndices && !selectedRowIndices.has(index)) {
				return null;
			}
			return getNumberCellValue(record.cells[columnId]);
		})
		.filter((val): val is number => val !== null);
};

const calculateStatisticsForValues = (
	values: number[],
): IColumnStatistics[string] => {
	if (values.length === 0) return { ...DEFAULT_STATISTICS };

	const calculated = Object.entries(STATISTIC_CALCULATORS).reduce(
		(acc, [key, calculator]) => {
			acc[key as keyof typeof STATISTIC_CALCULATORS] = calculator(values);
			return acc;
		},
		{} as Record<string, number>,
	);

	return {
		...calculated,
		count: values.length,
	} as IColumnStatistics[string];
};

export const calculateColumnStatistics = (
	columns: IColumn[],
	records: IRecord[],
	visibleColumnIndices: number[],
	selectedRowIndicesByColumn?: Map<number, Set<number>>,
): IColumnStatistics => {
	const statistics: IColumnStatistics = {};
	const processedColumnIds = new Set<string>();

	// Process ALL number columns to ensure statistics are always available
	// This fixes issues where visible columns might not be in visibleIndices due to virtual scrolling edge cases
	// Priority: process visible columns first (for performance), then process any remaining number columns
	for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
		const column = columns[columnIndex];
		if (!column || column.type !== CellType.Number) continue;

		// Skip if already processed (from visible columns)
		if (processedColumnIds.has(column.id)) continue;

		// Get selected row indices for this column (if any)
		const selectedRowIndices = selectedRowIndicesByColumn?.get(columnIndex);
		const values = extractColumnValues(
			records,
			column.id,
			selectedRowIndices,
		);
		statistics[column.id] = calculateStatisticsForValues(values);
		processedColumnIds.add(column.id);
	}

	// Also process visible columns (in case they weren't processed above)
	// This ensures visible columns are prioritized and get statistics even if there are duplicates
	for (const columnIndex of visibleColumnIndices) {
		const column = columns[columnIndex];
		if (!column || column.type !== CellType.Number) continue;

		// Skip if already processed
		if (processedColumnIds.has(column.id)) continue;

		// Get selected row indices for this column (if any)
		const selectedRowIndices = selectedRowIndicesByColumn?.get(columnIndex);
		const values = extractColumnValues(
			records,
			column.id,
			selectedRowIndices,
		);
		statistics[column.id] = calculateStatisticsForValues(values);
		processedColumnIds.add(column.id);
	}

	return statistics;
};

export const formatStatisticValue = (value: number): string => {
	return value.toLocaleString("en-US", {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	});
};

export const formatStatisticDisplay = (
	statisticName: string,
	value: number,
): string => {
	return `${statisticName} ${formatStatisticValue(value)}`;
};

/**
 * Returns label and formatted value for footer display (single-line layout).
 * Used by footer renderer for distinct styling of label vs value.
 */
export const formatStatisticForFooter = (
	statisticName: string,
	value: number,
): { label: string; formattedValue: string } => {
	return {
		label: statisticName,
		formattedValue: formatStatisticValue(value),
	};
};

/**
 * Extract selected row indices per column from a cell selection
 * Returns a Map where key is columnIndex and value is Set of selected row indices
 * Similar to Airtable/Google Sheets behavior: when cells are selected, show stats for selected cells per column
 */
export const getSelectedRowIndicesByColumn = (
	selection: CombinedSelection,
	columns: IColumn[],
): Map<number, Set<number>> => {
	const selectedRowsByColumn = new Map<number, Set<number>>();

	// Only process cell selections (not row or column selections)
	if (!selection.isCellSelection || selection.ranges.length < 2) {
		return selectedRowsByColumn;
	}

	const [startRange, endRange] = selection.ranges;
	const [startCol, startRow] = startRange;
	const [endCol, endRow] = endRange;

	// CRITICAL: Check if this is an actual selection range (not just a single active cell)
	// When a single cell is clicked, selection is created with [range, range] (same range twice)
	// We should only process if start and end are different (actual selection)
	const isActualSelection = startCol !== endCol || startRow !== endRow;
	if (!isActualSelection) {
		// Single cell = active cell, not a selection - return empty map
		return selectedRowsByColumn;
	}

	// Get the min/max bounds of the selection
	const minCol = Math.min(startCol, endCol);
	const maxCol = Math.max(startCol, endCol);
	const minRow = Math.min(startRow, endRow);
	const maxRow = Math.max(startRow, endRow);

	// For each column in the selection range, collect selected row indices
	for (let colIndex = minCol; colIndex <= maxCol; colIndex++) {
		// Skip if column doesn't exist or is not a number type
		if (colIndex < 0 || colIndex >= columns.length) continue;
		const column = columns[colIndex];
		if (!column || column.type !== CellType.Number) continue;

		const selectedRows = new Set<number>();

		// Check each row in the selection range to see if it's selected for this column
		for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
			// Check if this specific cell [colIndex, rowIndex] is in the selection
			if (selection.includes([colIndex, rowIndex])) {
				selectedRows.add(rowIndex);
			}
		}

		// Only add to map if there are selected rows for this column
		if (selectedRows.size > 0) {
			selectedRowsByColumn.set(colIndex, selectedRows);
		}
	}

	return selectedRowsByColumn;
};
