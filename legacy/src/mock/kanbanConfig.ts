// Phase 1: Mock Kanban view configuration
// Simulates Kanban view options from view model
// Reference: teable/packages/core/src/models/view/derivate/kanban-view-option.schema.ts

import type { IKanbanViewOptions } from "@/types/kanban";

// Mock Kanban view configuration
// Assumes we have a SingleSelect field called "status_field" (dbFieldName)
// with choices: "Hello", "Hi", "Namaste"
export const mockKanbanConfig: IKanbanViewOptions = {
	stackFieldId: "status_field", // Field to group by (SingleSelect field)
	coverFieldId: null, // No cover field for now
	isCoverFit: false,
	isFieldNameHidden: false, // Show field names on cards
	isEmptyStackHidden: false, // Show empty stacks (like "Hi")
};

// Mock field metadata for the stack field
// This would normally come from the fields array
import type { IColumn } from "@/types";
import { CellType } from "@/types";

export const mockStackField: IColumn = {
	id: "status_field",
	name: "Status",
	type: CellType.SCQ, // Single Choice Question (SingleSelect)
	width: 200,
	options: [
		"Hello",
		"Hi",
		"Namaste",
	],
};

