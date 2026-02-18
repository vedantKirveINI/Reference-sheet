/**
 * Action Handlers
 * Handlers for opening Sort/Filter/GroupBy modals from context menu
 */

import type { IColumn } from "@/types";
import { CellType } from "@/types";
import { useModalControlStore } from "@/stores/modalControlStore";
import {
	transformColumnToSortFormValue,
	findFieldInFieldsArray,
	transformColumnToGroupByFormValue,
} from "./transformers";

// Extended column type with rawId and rawType
type ExtendedColumn = IColumn & {
	rawId?: string | number;
	rawType?: string;
};

// Field type from fields array (as used in Sort/Filter/GroupBy)
interface FieldFromArray {
	id: number | string;
	name: string;
	dbFieldName?: string;
	type?: string;
}

/**
 * Check if column is a number type
 * @param column - Column object
 * @returns true if column is a number type
 */
export function isNumberField(column: ExtendedColumn): boolean {
	const rawType = column.rawType;
	const cellType = column.type;

	// Check rawType first (backend field type)
	if (rawType) {
		return (
			rawType === "NUMBER" ||
			rawType === "PERCENT" ||
			rawType === "CURRENCY"
		);
	}

	// Fallback to cell type
	return cellType === CellType.Number;
}

/**
 * Get dynamic sort label based on field type
 * @param column - Column object
 * @param order - Sort order ("asc" | "desc")
 * @returns Sort label string
 */
export function getSortLabel(
	column: ExtendedColumn,
	order: "asc" | "desc",
): string {
	const isNumber = isNumberField(column);

	if (order === "asc") {
		return isNumber ? "Sort 1 → 9" : "Sort A → Z";
	} else {
		return isNumber ? "Sort 9 → 1" : "Sort Z → A";
	}
}

/**
 * Open sort modal with pre-filled values
 * @param column - Column object
 * @param order - Sort order ("asc" | "desc")
 * @param currentSort - Current sort state
 * @param fields - Fields array from backend
 * @param closeMenu - Function to close context menu
 */
export function openSortModal(
	column: ExtendedColumn,
	order: "asc" | "desc",
	currentSort: any,
	fields: FieldFromArray[],
	closeMenu: () => void,
): void {
	// Transform column to form value
	const formValue = transformColumnToSortFormValue(column, order, fields);

	// If transformation failed (field not found), skip silently
	if (!formValue) {
		closeMenu();
		return;
	}

	// Get current sortObjs or empty array (in API format)
	const currentSortObjs = currentSort?.sortObjs || [];

	// Convert form value to API format
	const apiFormatSortObj = {
		fieldId: formValue.field.value,
		order: formValue.order.value,
		dbFieldName: formValue.field.dbFieldName,
		type: formValue.field.type,
	};

	// Append new sort entry (don't replace)
	const newSortObjs = [...currentSortObjs, apiFormatSortObj];

	// Create initial sort object (in API format)
	const initialSort = {
		sortObjs: newSortObjs,
		manualSort: currentSort?.manualSort || false,
	};

	// Open modal via store
	const { openSortModal: openModal } = useModalControlStore.getState();
	openModal(initialSort, fields);

	// Close context menu
	closeMenu();
}

/**
 * Open filter modal with pre-filled values
 * @param column - Column object
 * @param currentFilter - Current filter state
 * @param fields - Fields array from backend
 * @param closeMenu - Function to close context menu
 */
export function openFilterModal(
	column: ExtendedColumn,
	currentFilter: any,
	fields: FieldFromArray[],
	closeMenu: () => void,
): void {
	// Find the field to pre-select
	const field = findFieldInFieldsArray(column, fields);

	// If field not found, skip silently
	if (!field) {
		closeMenu();
		return;
	}

	const existingChilds = currentFilter?.childs || [];

	const newCondition = {
		field: field.id,
		type: field.type || column.rawType || "SHORT_TEXT",
		key: field.name,
	};

	const newChilds = [...existingChilds, newCondition];

	const initialFilter = {
		id: currentFilter?.id || `${Date.now()}_`,
		condition: currentFilter?.condition || "and",
		childs: newChilds,
	};

	const { openFilterModal: openModal } = useModalControlStore.getState();
	openModal(initialFilter, fields);

	closeMenu();
}

/**
 * Open group by modal with pre-filled values
 * @param column - Column object
 * @param order - Group order ("asc" | "desc")
 * @param currentGroupBy - Current groupBy state
 * @param fields - Fields array from backend
 * @param closeMenu - Function to close context menu
 */
export function openGroupByModal(
	column: ExtendedColumn,
	order: "asc" | "desc",
	currentGroupBy: any,
	fields: FieldFromArray[],
	closeMenu: () => void,
): void {
	// Transform column to form value
	const formValue = transformColumnToGroupByFormValue(column, order, fields);

	// If transformation failed (field not found), skip silently
	if (!formValue) {
		closeMenu();
		return;
	}

	// Get current groupObjs or empty array (in API format)
	const currentGroupObjs = currentGroupBy?.groupObjs || [];

	// Convert form value to API format
	const apiFormatGroupObj = {
		fieldId: formValue.field.value,
		order: formValue.order.value,
		dbFieldName: formValue.field.dbFieldName,
		type: formValue.field.type,
	};

	// Append new group entry (don't replace)
	const newGroupObjs = [...currentGroupObjs, apiFormatGroupObj];

	// Create initial groupBy object (in API format)
	const initialGroupBy = {
		groupObjs: newGroupObjs,
	};

	// Open modal via store
	const { openGroupByModal: openModal } = useModalControlStore.getState();
	openModal(initialGroupBy, fields);

	// Close context menu
	closeMenu();
}
