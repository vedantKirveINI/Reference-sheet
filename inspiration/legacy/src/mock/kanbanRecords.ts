// Phase 1: Mock Kanban records
// Simulates records for Kanban view grouped by status_field
// Reference: sheets-backend/src/features/record/record.service.ts (getRecords response)

import type { IMockRecord } from "./groupedRecords";

// Extended interface to allow null status_field for uncategorized records
export interface IKanbanMockRecord extends Omit<IMockRecord, 'status_field'> {
	status_field: string | null;
}

// Mock records for Kanban view
// Grouped by status_field with values: "Hello", "Hi", "Namaste", and null (uncategorized)
export const mockKanbanRecords: IKanbanMockRecord[] = [
	// Records in "Hello" stack (2 records)
	{
		__id: 1,
		label_field: "Category A",
		age_field: 25,
		status_field: "Hello", // Stack: Hello
		name_field: "Vedantd",
		number_field: 1,
		amount_field: 100.0,
	},
	{
		__id: 2,
		label_field: "Category A",
		age_field: 20,
		status_field: "Hello", // Stack: Hello
		name_field: "Unnamed record",
		number_field: 2,
		amount_field: 200.0,
	},

	// Records in "Hi" stack (0 records - empty stack)
	// No records with status_field = "Hi"

	// Records in "Namaste" stack (1 record)
	{
		__id: 3,
		label_field: "Category B",
		age_field: 30,
		status_field: "Namaste", // Stack: Namaste
		name_field: "Shubham",
		number_field: 3,
		amount_field: 300.0,
	},

	// Uncategorized records (38 records with null/empty status_field)
	// Sample of uncategorized records
	{
		__id: 4,
		label_field: "Category A",
		age_field: 25,
		status_field: null, // Uncategorized
		name_field: "Abhay",
		number_field: 1,
		amount_field: 200.0,
	},
	{
		__id: 5,
		label_field: "Category A",
		age_field: 20,
		status_field: null, // Uncategorized
		name_field: "Abhay copy",
		number_field: 1,
		amount_field: 300.0,
	},
	{
		__id: 6,
		label_field: "Category A",
		age_field: 20,
		status_field: "", // Empty string also counts as uncategorized
		name_field: "Unnamed record",
		number_field: 2,
		amount_field: 150.0,
	},
	{
		__id: 7,
		label_field: "Category B",
		age_field: 30,
		status_field: null, // Uncategorized
		name_field: "Rahul",
		number_field: 3,
		amount_field: 250.0,
	},
	{
		__id: 8,
		label_field: "Category C",
		age_field: 25,
		status_field: null, // Uncategorized
		name_field: "Vaibhav",
		number_field: 4,
		amount_field: 400.0,
	},
	// ... (would have 38 total uncategorized records in real scenario)
	// For now, we have 5 sample records representing the 38
];

