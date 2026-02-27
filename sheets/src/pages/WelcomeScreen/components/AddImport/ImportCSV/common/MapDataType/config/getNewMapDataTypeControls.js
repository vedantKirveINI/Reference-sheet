import { ALLOWED_FIELD_TYPES } from "../../../constant";

export const getNewMapDataTypeControls = () => {
	return [
		{
			name: "map_type_fields",
			type: "fieldArray",
			showFirstFieldDelete: false,
			focusFieldName: "field",
			variant: "black-text",
			size: "medium",
			controls: [
				{
					name: "field",
					type: "text",
					disabled: true,
					textFieldProps: { placeholder: "Enter text" },
					rules: {
						required: "Text is required",
					},
					span: 6,
				},
				{
					name: "type",
					type: "select",
					options: ALLOWED_FIELD_TYPES,
					isOptionEqualToValue: (option, selectedValue) =>
						option.value === selectedValue.value,
					getOptionLabel: (option) => option?.label || "",
					searchable: true,
					textFieldProps: { placeholder: "Select a data type" },
					rules: {
						required: "Please select an option",
					},
					span: 6,
				},
			],
		},
	];
};
