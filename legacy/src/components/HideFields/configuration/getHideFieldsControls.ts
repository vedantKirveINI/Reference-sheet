import { IColumn } from "@/types";

export interface HideFieldControl {
	name: string; // fieldId
	label?: string; // Not used for switch, but kept for consistency
	type: "switch";
	rules?: {
		required?: boolean;
	};
	// Custom props for our use case
	column: IColumn;
	isPrimary: boolean;
}

export const getHideFieldsControls = (
	columns: IColumn[],
	primaryFieldId: string | null,
): HideFieldControl[] => {
	return columns.map((column) => {
		const fieldId = String((column as any).rawId || column.id);
		return {
			name: fieldId,
			type: "switch" as const,
			rules: {
				required: false,
			},
			column,
			isPrimary: fieldId === primaryFieldId,
		};
	});
};
