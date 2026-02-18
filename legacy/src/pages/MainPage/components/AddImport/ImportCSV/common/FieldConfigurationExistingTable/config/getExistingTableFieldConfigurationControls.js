const getExistingTableFieldConfigurationControls = ({
	filteredTableFieldsOptions,
	mutatedCsvFieldHeaders = [],
	tableFields = [],
}) => {
	const controls = [
		{
			name: "first_row_as_header",
			label: "Do you wish to exclude the first row from data?",
			defaultValue: "Yes",
			options: ["Yes", "No"],
			type: "radio",
			row: true,
			rules: { required: true },
			mainRadioProps: {
				labelProps: {
					variant: "body1",
				},
				variant: "black",
			},
			radioProps: {
				size: "small",
			},
		},
		{
			name: "map_fields",
			type: "fieldArray",
			showFirstFieldDelete: false,
			addButtonLabel: "ADD FIELD",
			addButtonColour: "#212121",
			focusFieldName: "field",
			variant: "black-text",
			size: "medium",
			getAppendValue: () => ({
				field: null,
				type: {
					label: "Create new field",
					value: "ADD",
				},
			}),
			controls: [
				{
					name: "field",
					type: "select",
					isOptionEqualToValue: (option, selectedValue) =>
						option.value === selectedValue.value,
					getOptionLabel: (option) => option?.label || "",
					searchable: true,
					options: mutatedCsvFieldHeaders,
					disabled: false,
					textFieldProps: { placeholder: "Select a csv field" },
					rules: {
						required: "Please select a csv field",
					},
					span: 6,
				},
				{
					name: "type",
					type: "select",
					disableClearable: false,
					isOptionEqualToValue: (option, selectedValue) =>
						option.value === selectedValue.value,
					getOptionLabel: (option) => option?.label || "",
					searchable: true,
					getDynamicOptions: (selectedValue) => {
						const baseOptions = filteredTableFieldsOptions();

						const matchingField = tableFields.find(
							(field) => field.id === selectedValue,
						);
						const label = matchingField
							? matchingField.name
							: selectedValue;

						// Add current value if missing
						if (
							selectedValue &&
							!baseOptions.some(
								(opt) => opt.value === selectedValue,
							)
						) {
							baseOptions.push({
								label: label,
								value: selectedValue,
							});
						}

						return baseOptions;
					},
					textFieldProps: { placeholder: "Select a field" },
					span: 6,
					rules: {
						required: "Please select a field to map",
					},
				},
			],
		},
	];

	return controls;
};

export default getExistingTableFieldConfigurationControls;
