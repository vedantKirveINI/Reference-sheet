/**
 * Transformation Utilities
 * Convert column data to formats expected by Sort/Filter/GroupBy components
 */

import type { IColumn } from "@/types";
import { ORDER_BY_OPTIONS_MAPPING } from "@/components/Sort/constant";

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
 * Find field in fields array by column's rawId or id
 * @param column - Column object with rawId or id
 * @param fields - Fields array from backend
 * @returns Field object or null if not found
 */
export function findFieldInFieldsArray(
	column: ExtendedColumn,
	fields: FieldFromArray[],
): FieldFromArray | null {
	if (!fields || fields.length === 0) {
		return null;
	}

	// Try to find by rawId first (field ID)
	if (column.rawId !== undefined) {
		const field = fields.find(
			(f) =>
				f.id === column.rawId ||
				Number(f.id) === Number(column.rawId) ||
				String(f.id) === String(column.rawId),
		);
		if (field) {
			return field;
		}
	}

	// Fallback to id (dbFieldName)
	if (column.id) {
		const field = fields.find(
			(f) =>
				f.id === column.id ||
				f.dbFieldName === column.id ||
				String(f.id) === String(column.id),
		);
		if (field) {
			return field;
		}
	}

	return null;
}

/**
 * Transform column to Sort form value
 * @param column - Column object
 * @param order - Sort order ("asc" | "desc")
 * @param fields - Fields array from backend
 * @returns Form value object or null if field not found
 */
export function transformColumnToSortFormValue(
	column: ExtendedColumn,
	order: "asc" | "desc",
	fields: FieldFromArray[],
): { field: any; order: any } | null {
	const field = findFieldInFieldsArray(column, fields);
	if (!field) {
		return null;
	}

	const orderOption = ORDER_BY_OPTIONS_MAPPING.find(
		(opt) => opt.value === order,
	) || ORDER_BY_OPTIONS_MAPPING[0];

	return {
		field: {
			value: field.id,
			label: field.name,
			dbFieldName: field.dbFieldName || field.id,
			type: field.type || column.rawType,
		},
		order: orderOption,
	};
}

/**
 * Transform column to Filter condition
 * @param column - Column object
 * @param fields - Fields array from backend
 * @returns Filter condition object or null if field not found
 */
export function transformColumnToFilterCondition(
	column: ExtendedColumn,
	fields: FieldFromArray[],
): { childs: Array<{ field: string | number; operator?: any; value?: any; key?: string; type?: string }> } | null {
	const field = findFieldInFieldsArray(column, fields);
	if (!field) {
		return null;
	}

	const fieldType = field.type || column.rawType || "SHORT_TEXT";

	return {
		childs: [
			{
				field: field.id,
				type: fieldType,
			},
		],
	};
}

/**
 * Transform column to GroupBy form value
 * @param column - Column object
 * @param order - Group order ("asc" | "desc")
 * @param fields - Fields array from backend
 * @returns Form value object or null if field not found
 */
export function transformColumnToGroupByFormValue(
	column: ExtendedColumn,
	order: "asc" | "desc",
	fields: FieldFromArray[],
): { field: any; order: any } | null {
	const field = findFieldInFieldsArray(column, fields);
	if (!field) {
		return null;
	}

	const orderOption = ORDER_BY_OPTIONS_MAPPING.find(
		(opt) => opt.value === order,
	) || ORDER_BY_OPTIONS_MAPPING[0];

	return {
		field: {
			value: field.id,
			label: field.name,
			dbFieldName: field.dbFieldName || field.id,
			type: field.type || column.rawType,
		},
		order: orderOption,
	};
}
