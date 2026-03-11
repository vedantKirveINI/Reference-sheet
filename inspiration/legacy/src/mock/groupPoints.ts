// Phase 1: Mock groupPoints array
// Simulates groupPoints array from backend
// Reference: teable/packages/openapi/src/aggregation/type.ts

import type { IGroupPoint } from "@/types/grouping";
import { GroupPointType } from "@/types/grouping";

// Mock groupPoints for: Group by Label (ASC) → Age (DESC)
export const mockGroupPoints: IGroupPoint[] = [
	// Category A group (depth 0)
	{
		type: GroupPointType.Header,
		depth: 0,
		value: "Category A",
		id: "hash_label_CategoryA",
		isCollapsed: false,
	},
	// Age 25 nested group (depth 1)
	{
		type: GroupPointType.Header,
		depth: 1,
		value: 25,
		id: "hash_label_A_age_25",
		isCollapsed: false,
	},
	{ type: GroupPointType.Row, count: 1 }, // 1 record
	// Age 20 nested group (depth 1)
	{
		type: GroupPointType.Header,
		depth: 1,
		value: 20,
		id: "hash_label_A_age_20",
		isCollapsed: false,
	},
	{ type: GroupPointType.Row, count: 2 }, // 2 records
	// Category B group (depth 0)
	{
		type: GroupPointType.Header,
		depth: 0,
		value: "Category B",
		id: "hash_label_CategoryB",
		isCollapsed: false,
	},
	// Age 30 nested group (depth 1)
	{
		type: GroupPointType.Header,
		depth: 1,
		value: 30,
		id: "hash_label_B_age_30",
		isCollapsed: false,
	},
	{ type: GroupPointType.Row, count: 1 }, // 1 record
	// Age 20 nested group (depth 1)
	{
		type: GroupPointType.Header,
		depth: 1,
		value: 20,
		id: "hash_label_B_age_20",
		isCollapsed: false,
	},
	{ type: GroupPointType.Row, count: 1 }, // 1 record
	// Category C group (depth 0)
	{
		type: GroupPointType.Header,
		depth: 0,
		value: "Category C",
		id: "hash_label_CategoryC",
		isCollapsed: false,
	},
	// Age 25 nested group (depth 1)
	{
		type: GroupPointType.Header,
		depth: 1,
		value: 25,
		id: "hash_label_C_age_25",
		isCollapsed: false,
	},
	{ type: GroupPointType.Row, count: 2 }, // 2 records
	// Age 20 nested group (depth 1)
	{
		type: GroupPointType.Header,
		depth: 1,
		value: 20,
		id: "hash_label_C_age_20",
		isCollapsed: false,
	},
	{ type: GroupPointType.Row, count: 1 }, // 1 record
];
