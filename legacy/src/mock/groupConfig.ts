// Phase 1: Mock groupBy configuration
// Simulates groupBy configuration from view
// Reference: sheets-backend/src/features/view/DTO/update_group.dto.ts

import type { IGroupConfig } from "@/types/grouping";

export const mockGroupConfig: IGroupConfig = {
	groupObjs: [
		{
			fieldId: 88301,
			order: "asc",
			dbFieldName: "label_field",
			type: "SHORT_TEXT",
		},
		{
			fieldId: 88303,
			order: "desc",
			dbFieldName: "age_field",
			type: "NUMBER",
		},
	],
};
