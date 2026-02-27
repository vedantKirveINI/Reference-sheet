/**
 * Column Filtering Utilities
 * Helper functions for filtering columns based on columnMeta visibility settings
 */

import { IColumn } from "@/types";
import { parseColumnMeta } from "./columnMetaUtils";

/**
 * Filter out columns where columnMeta[fieldId].is_hidden === true
 * 
 * @param columns - Array of columns to filter
 * @param columnMeta - Parsed columnMeta object or JSON string
 * @returns Array of visible columns (where is_hidden !== true)
 */
export const filterHiddenColumns = (
	columns: IColumn[],
	columnMeta: Record<string, any> | string | null | undefined,
): IColumn[] => {
	// Parse columnMeta if string, otherwise use as-is
	const parsedColumnMeta =
		typeof columnMeta === "string" ? parseColumnMeta(columnMeta) : columnMeta || {};

	// Filter columns based on is_hidden property
	return columns.filter((column) => {
		// Get fieldId (use rawId if available, otherwise use id)
		const fieldId = (column as any).rawId || column.id;
		const fieldIdKey = String(fieldId);

		// Check if column is hidden
		const isHidden = parsedColumnMeta[fieldIdKey]?.is_hidden;

		// Return column if it's not hidden (is_hidden !== true)
		return isHidden !== true;
	});
};
