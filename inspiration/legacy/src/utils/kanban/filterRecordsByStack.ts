// Phase 2: Filter records by stack
// Filters records array to only include records matching a specific stack
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/utils/filter.ts

import type { IRecord } from "@/types";
import type { IStackData } from "@/types/kanban";
import { UNCATEGORIZED_STACK_ID } from "@/types/kanban";
import type { IColumn } from "@/types";
import { CellType } from "@/types";

/**
 * Filters records array to only include records matching a specific stack
 *
 * @param records - Array of records to filter
 * @param stack - The stack to filter by
 * @param stackField - The field used for stacking
 * @returns Filtered array of records
 */
export function filterRecordsByStack(
	records: IRecord[],
	stack: IStackData,
	stackField: IColumn,
): IRecord[] {
	const { id: stackId, data: stackData } = stack;
	const isUncategorized =
		stackId === UNCATEGORIZED_STACK_ID || stackData == null;

	// Get the field ID (use dbFieldName if available, otherwise use id)
	const fieldId = stackField.id;

	return records.filter((record) => {
		const cell = record.cells[fieldId];

		// Handle uncategorized records
		if (isUncategorized) {
			// Uncategorized: cell is null, undefined, empty string, or empty array
			if (!cell) return true;

			const cellValue = cell.data;

			// Check for null, undefined, or empty string
			if (cellValue == null || cellValue === "") return true;

			// Check for empty array
			if (Array.isArray(cellValue) && cellValue.length === 0) return true;

			return false;
		}

		// Handle categorized records
		if (!cell) return false;

		const cellValue = cell.data;

		// For SingleSelect (SCQ/DropDown), compare the value directly
		if (
			stackField.type === CellType.SCQ ||
			stackField.type === CellType.DropDown
		) {
			return cellValue === stackData;
		}

		// For MCQ (MultipleSelect), check if stackData is in the array
		if (stackField.type === CellType.MCQ) {
			if (Array.isArray(cellValue)) {
				return cellValue.includes(stackData);
			}
			return false;
		}

		// For other field types, direct comparison
		return cellValue === stackData;
	});
}

/**
 * Helper function to check if a record belongs to a stack
 * (More efficient for single record checks)
 */
export function recordBelongsToStack(
	record: IRecord,
	stack: IStackData,
	stackField: IColumn,
): boolean {
	const { id: stackId, data: stackData } = stack;
	const isUncategorized =
		stackId === UNCATEGORIZED_STACK_ID || stackData == null;
	const fieldId = stackField.id;
	const cell = record.cells[fieldId];

	// Handle uncategorized records
	if (isUncategorized) {
		if (!cell) return true;
		const cellValue = cell.data;
		if (cellValue == null || cellValue === "") return true;
		if (Array.isArray(cellValue) && cellValue.length === 0) return true;
		return false;
	}

	// Handle categorized records
	if (!cell) return false;
	const cellValue = cell.data;

	// For SingleSelect
	if (
		stackField.type === CellType.SCQ ||
		stackField.type === CellType.DropDown
	) {
		return cellValue === stackData;
	}

	// For MultipleSelect
	if (stackField.type === CellType.MCQ) {
		if (Array.isArray(cellValue)) {
			return cellValue.includes(stackData);
		}
		return false;
	}

	// For other types
	return cellValue === stackData;
}

/**
 * Finds the last record in a stack (highest order value)
 * Used for determining where to insert new records at the bottom of a stack
 *
 * @param records - Array of all records (already sorted by stackFieldId and _row_view{viewId})
 * @param rowHeaders - Array of row headers with orderValue
 * @param stack - The stack to find the last record in
 * @param stackField - The field used for stacking
 * @returns The last record in the stack, or null if stack is empty
 */
export function getLastRecordInStack(
	records: IRecord[],
	rowHeaders: Array<{ orderValue?: number }>,
	stack: IStackData,
	stackField: IColumn,
): { record: IRecord; orderValue: number } | null {
	const stackRecords = filterRecordsByStack(records, stack, stackField);	if (stackRecords.length === 0) {
		return null;
	}

	// Find the record with the highest orderValue
	let lastRecord: IRecord | null = null;
	let maxOrderValue = -Infinity;

	stackRecords.forEach((record) => {
		const recordIndex = records.findIndex((r) => r.id === record.id);
		if (recordIndex >= 0) {
			const rowHeader = rowHeaders[recordIndex];
			const orderValue = rowHeader?.orderValue ?? -Infinity;			if (orderValue > maxOrderValue) {
				maxOrderValue = orderValue;
				lastRecord = record;
			}
		}
	});

	if (!lastRecord || maxOrderValue === -Infinity) {
		return null;
	}

	return { record: lastRecord, orderValue: maxOrderValue };
}
