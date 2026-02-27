// Kanban View Type Definitions
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/type.ts

// Stack data structure - represents a column in Kanban view
export interface IStackData {
	id: string; // Stack/column ID (from groupPoint.id or choice.id)
	/**
	 * The grouping value from the group header point (groupPoint.value)
	 * 
	 * Possible values based on field type:
	 * - SingleSelect (SCQ/DropDown): string (choice name, e.g., "Hello", "Hi")
	 * - User field: IUserCellValue object { id, title, email, avatarUrl }
	 * - Text field: string (the text value)
	 * - Number field: number (the number value)
	 * - Date field: string (ISO date string) or Date object
	 * - MultipleSelect (MCQ): string[] (array of selected choices)
	 * - Uncategorized: null (for records with null/empty field values)
	 * 
	 * This is the actual value that records in this stack have for the stackField.
	 * Used for:
	 * - Displaying stack title/name
	 * - Filtering records to this stack
	 * - Updating records when cards are moved between stacks
	 */
	data: unknown; // The grouping value from groupPoint.value
	count: number; // Number of records in this stack
}

// Kanban view options configuration
export interface IKanbanViewOptions {
	stackFieldId?: string; // Field ID to group by (must be SingleSelect, User, etc.)
	coverFieldId?: string | null; // Attachment field for card cover images
	isCoverFit?: boolean; // Whether to fit cover images
	isFieldNameHidden?: boolean; // Hide field names on cards
	isEmptyStackHidden?: boolean; // Hide empty stacks/columns
}

// Kanban permissions - matches your backend permission model
// Simple view/edit model: canEdit = true means can do everything, false means read-only
export interface IKanbanPermission {
	canEdit: boolean; // If true, can do everything (create/edit/delete stacks and cards). If false, read-only.
}

// Constants
export const UNCATEGORIZED_STACK_ID = 'uncategorized';

