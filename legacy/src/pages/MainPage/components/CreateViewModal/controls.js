import { ViewType, VIEW_TYPE_DISPLAY_NAMES } from "@/types/view";
import { CellType } from "@/types";
import QUESTION_TYPE_ICON_MAPPING from "@/constants/questionTypeIconMapping";

const getCreateViewControls = () => {
	const viewTypeOptions = Object.values(ViewType).map((type) => ({
		value: type,
		label: VIEW_TYPE_DISPLAY_NAMES[type],
	}));

	const controls = [
		{
			name: "name",
			label: "View name",
			placeholder: "Enter view name",
			type: "text",
			rules: {
				required: "View name is required",
			},
		},
		{
			name: "type",
			label: "View type",
			placeholder: "Select view type",
			type: "select",
			options: viewTypeOptions,
			rules: {
				required: "View type is required",
			},
		},
	];

	return controls;
};

/**
 * Get Kanban-specific controls (stacking field and hide empty stack toggle)
 * @param {Array} columns - Array of column/field objects
 * @returns {Array} Array of control configurations
 */
export const getKanbanControls = (columns = []) => {
	// Filter to only SCQ fields
	const scqFields = columns.filter(
		(col) =>
			col.rawType === "SCQ" ||
			col.type === CellType.SCQ ||
			col.type === "SCQ",
	);

	// Get SCQ icon
	const scqIcon = QUESTION_TYPE_ICON_MAPPING["SCQ"];

	// Build radio options from SCQ fields
	// IMPORTANT: columns.id = dbFieldName, but rawId = actual field ID
	// Use rawId (actual field ID) instead of id (dbFieldName) for stackFieldId
	const stackingFieldOptions = scqFields.map((field) => {
		// Use rawId if available (actual field ID), otherwise fallback to id
		// But note: id is actually dbFieldName, so we should use rawId
		const actualFieldId = field.rawId ?? field.id;
		return {
			value: actualFieldId, // Use actual field ID (rawId), not dbFieldName (id)
			label: field.name,
			icon: scqIcon,
			fieldId: actualFieldId, // Store field ID for reference
		};
	});

	const controls = [
		{
			name: "stackingField",
			label: "Choose a stacking field",
			description:
				"Which field would you like to use for this kanban view? Your records will be stacked based on this field.",
			type: "radio",
			options: stackingFieldOptions.map((opt) => opt.value), // RadioController expects array of strings
			optionDetails: stackingFieldOptions, // Store full details for custom rendering
			mainRadioProps: {
				variant: "black",
			},
			rules: {
				required: "Stacking field is required",
			},
		},
		{
			name: "hideEmptyStack",
			label: "Hide empty stack",
			type: "switch",
			defaultValue: false,
			sx: {
				transform: "scale(0.8)",
				transformOrigin: "left center",
			},
		},
	];

	return controls;
};

export default getCreateViewControls;
