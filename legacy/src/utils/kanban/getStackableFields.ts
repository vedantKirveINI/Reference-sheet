// Utility to filter and format stackable fields for Kanban view
// Stackable fields: SCQ, User (future support)

import type { IColumn } from "@/types";
import { CellType } from "@/types";
import QUESTION_TYPE_ICON_MAPPING from "@/constants/questionTypeIconMapping";

export interface StackableFieldOption {
	value: string | number; // Field ID (rawId)
	label: string; // Field name
	icon: string; // Icon path
	fieldId: string | number; // Store field ID for reference
}

/**
 * Filter columns to only include stackable field types for Kanban
 * Currently supports: SCQ, DropDown
 * Future: User fields
 * 
 * @param columns - Array of column/field objects
 * @returns Array of formatted stackable field options
 */
export function getStackableFields(
	columns: IColumn[]
): StackableFieldOption[] {
	// Filter to stackable field types
	const stackableFields = columns.filter((col) => {
		const type = col.type;
		const rawType = (col as any).rawType;
		
		return (
			rawType === "SCQ" ||
			type === CellType.SCQ ||
			// type === CellType.DropDown ||
			type === "SCQ" 
			// type === "DROP_DOWN_STATIC"
			// TODO: Add User field support when available
			// || type === CellType.User
		);
	});

	// Get SCQ icon (used for both SCQ and DropDown)
	const scqIcon = QUESTION_TYPE_ICON_MAPPING["SCQ"];

	// Build formatted options from stackable fields
	// IMPORTANT: columns.id = dbFieldName, but rawId = actual field ID
	// Use rawId (actual field ID) instead of id (dbFieldName) for stackFieldId
	const stackingFieldOptions: StackableFieldOption[] = stackableFields.map(
		(field) => {
			// Use rawId if available (actual field ID), otherwise fallback to id
			// But note: id is actually dbFieldName, so we should prefer rawId
			const actualFieldId = (field as any).rawId ?? field.id;
			
			return {
				value: actualFieldId, // Use actual field ID (rawId), not dbFieldName (id)
				label: field.name,
				icon: scqIcon, // Use SCQ icon for all stackable fields
				fieldId: actualFieldId, // Store field ID for reference
			};
		}
	);

	return stackingFieldOptions;
}

