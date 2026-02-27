import isEmpty from "lodash/isEmpty";

import ENHANCEMENT_OPTIONS from "../constants/enhancementOptions";

function getEnrichmentControls({ value = {} }) {
	const requiredInputControls = [
		{
			name: "entityType",
			type: "select",
			searchable: true,
			label: "Select enhancement type",
			getOptionLabel: (option) => option.label,
			options: ENHANCEMENT_OPTIONS,
			disableClearable: false,
			textFieldProps: { placeholder: "Select enhancement" },
			disabled: !isEmpty(value),
			rules: {
				required: "Enhancement type is required",
			},
			sx: {
				".MuiInputBase-input": {
					...(!isEmpty(value) ? { cursor: "not-allowed" } : {}),
				},
			},
		},
	];

	const commonControls = [
		{
			name: "fieldDescription",
			type: "text",
			label: "Description",
			placeholder: "Enter description (optional)",
		},
	];

	const runConfigurationControls = [
		{
			name: "autoUpdate",
			label: "Auto-update when a new domain has been entered",
			type: "switch",
		},
	];

	return {
		requiredInputControls,
		commonControls,
		runConfigurationControls,
	};
}

export default getEnrichmentControls;
