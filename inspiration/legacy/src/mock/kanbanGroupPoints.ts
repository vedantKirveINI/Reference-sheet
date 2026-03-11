// Phase 1: Mock Kanban groupPoints array
// Simulates groupPoints array from backend for Kanban view
// Reference: teable/packages/openapi/src/aggregation/type.ts
// 
// For Kanban, we group by a SingleSelect field (status_field) with values:
// - "Hello" (2 records)
// - "Hi" (0 records - empty stack)
// - "Namaste" (1 record)
// - Uncategorized (38 records with null/empty status_field)

import type { IGroupPoint } from "@/types/grouping";
import { GroupPointType } from "@/types/grouping";

// Mock groupPoints for Kanban: Group by status_field (SingleSelect)
// Note: Kanban uses single-level grouping (depth: 0 only)
export const mockKanbanGroupPoints: IGroupPoint[] = [
	// "Hello" stack (depth 0)
	{
		type: GroupPointType.Header,
		depth: 0,
		value: "Hello",
		id: "stack_hello",
		isCollapsed: false,
	},
	{ type: GroupPointType.Row, count: 2 }, // 2 records in "Hello" stack

	// "Hi" stack (depth 0) - empty stack
	{
		type: GroupPointType.Header,
		depth: 0,
		value: "Hi",
		id: "stack_hi",
		isCollapsed: false,
	},
	{ type: GroupPointType.Row, count: 0 }, // 0 records in "Hi" stack

	// "Namaste" stack (depth 0)
	{
		type: GroupPointType.Header,
		depth: 0,
		value: "Namaste",
		id: "stack_namaste",
		isCollapsed: false,
	},
	{ type: GroupPointType.Row, count: 1 }, // 1 record in "Namaste" stack

	// Uncategorized stack (depth 0) - records with null/empty status_field
	{
		type: GroupPointType.Header,
		depth: 0,
		value: null, // null indicates uncategorized
		id: "uncategorized",
		isCollapsed: false,
	},
	{ type: GroupPointType.Row, count: 38 }, // 38 uncategorized records
];

