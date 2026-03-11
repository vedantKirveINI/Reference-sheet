// Phase 1: Build group collection (groupColumns + getGroupCell)
// Reference: teable/packages/sdk/src/components/grid-enhancements/hooks/use-grid-group-collection.ts

import type { IGroupConfig, IGroupCollection, IGroupColumn } from "@/types/grouping";
import type { ICell } from "@/types";

interface IField {
	id: number;
	name: string;
	type: string;
	dbFieldName?: string;
}

/**
 * Builds groupColumns array from group configuration
 * CRITICAL: Must preserve depth mapping - don't filter out null/undefined!
 */
const generateGroupColumns = (fields: IField[], groupConfig: IGroupConfig): IGroupColumn[] => {
	return fields
		.map((field, index) => {
			// If field is missing, create placeholder to preserve depth mapping
			if (!field) {
				const groupObj = groupConfig.groupObjs[index];
				return {
					id: groupObj?.fieldId || 0,
					name: groupObj?.dbFieldName || `Field ${index}`, // Use dbFieldName as fallback
					width: 200,
					icon: "text",
				};
			}

			const { id, name, type } = field;

			return {
				id,
				name,
				width: 200, // Default width
				icon: type.toLowerCase(), // Simple icon mapping
			};
		});
	// CRITICAL: Do NOT filter out null/undefined - we need to preserve depth indices!
	// Each index in groupColumns must match its depth value
};

/**
 * Generates a function that converts cell values to ICell format for group headers
 */
const useGenerateGroupCellFn = (fields: IField[], groupConfig: IGroupConfig) => {
	return (cellValue: unknown, depth: number): ICell => {
		const field = fields[depth];

		if (!field) {
			return {
				type: "String" as const,
				data: "",
				displayData: "",
			};
		}

		const { type } = field;
		const emptyStr = "Empty"; // Show "Empty" instead of "(Empty)" (Airtable-style)

		// Handle null/undefined values
		if (cellValue == null) {
			return {
				type: "String" as const,
				data: emptyStr,
				displayData: emptyStr,
			};
		}

		// Convert based on field type
		switch (type) {
			case "SHORT_TEXT":
			case "LONG_TEXT":
				return {
					type: "String" as const,
					data: String(cellValue),
					displayData: String(cellValue),
				};

			case "NUMBER":
				return {
					type: "Number" as const,
					data: Number(cellValue),
					displayData: String(cellValue),
				};

			case "DROP_DOWN":
			case "MULTIPLE_CHOICE":
				// For select fields, display the value as string
				return {
					type: "String" as const,
					data: String(cellValue),
					displayData: String(cellValue),
				};

			default:
				// Default to string representation
				return {
					type: "String" as const,
					data: String(cellValue),
					displayData: String(cellValue),
				};
		}
	};
};

/**
 * Builds IGroupCollection from group configuration and field metadata
 */
export const buildGroupCollection = (
	groupConfig: IGroupConfig,
	fields: IField[],
): IGroupCollection => {
	if (!groupConfig?.groupObjs || groupConfig.groupObjs.length === 0) {
		return {
			groupColumns: [],
			getGroupCell: () => ({
				type: "String" as const,
				data: "",
				displayData: "",
			}),
		};
	}

	// IMPORTANT: The fields array is already in the correct order (mapped from groupConfig.groupObjs in GridView)
	// We should use it directly instead of re-mapping, which could break the order
	// CRITICAL: Do NOT filter out undefined fields - we need to preserve depth mapping!
	// If a field is missing, we'll create a placeholder in generateGroupColumns
	const groupFields = fields; // Use fields directly - don't filter to preserve depth indices

	const generateGroupCellFn = useGenerateGroupCellFn(groupFields, groupConfig);

	// Generate group columns - CRITICAL: pass groupConfig to create placeholders if needed
	const groupColumns = generateGroupColumns(groupFields, groupConfig);

	return {
		groupColumns,
		getGroupCell: generateGroupCellFn,
	};
};

