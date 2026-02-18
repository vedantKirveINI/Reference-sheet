// Phase 1: Mock grouped records
// Simulates sorted records from backend (already grouped by Label ASC, Age DESC)
// Reference: sheets-backend/src/features/record/record.service.ts (getRecords response)

export interface IMockRecord {
	__id: number;
	label_field: string;
	age_field: number;
	status_field: string;
	name_field: string;
	[key: string]: unknown;
}

export const mockGroupedRecords: IMockRecord[] = [
	{
		__id: 1,
		label_field: "Category A",
		age_field: 25,
		status_field: "Active",
		name_field: "Charlie",
	},
	{
		__id: 2,
		label_field: "Category A",
		age_field: 20,
		status_field: "Active",
		name_field: "Alice",
	},
	{
		__id: 3,
		label_field: "Category A",
		age_field: 20,
		status_field: "Inactive",
		name_field: "Bob",
	},
	{
		__id: 4,
		label_field: "Category B",
		age_field: 20,
		status_field: "Active",
		name_field: "David",
	},
	{
		__id: 5,
		label_field: "Category B",
		age_field: 30,
		status_field: "Active",
		name_field: "Eve",
	},
	{
		__id: 6,
		label_field: "Category C",
		age_field: 25,
		status_field: "Inactive",
		name_field: "Frank",
	},
	{
		__id: 7,
		label_field: "Category C",
		age_field: 25,
		status_field: "Active",
		name_field: "Grace",
	},
	{
		__id: 8,
		label_field: "Category C",
		age_field: 20,
		status_field: "Active",
		name_field: "Henry",
	},
];
