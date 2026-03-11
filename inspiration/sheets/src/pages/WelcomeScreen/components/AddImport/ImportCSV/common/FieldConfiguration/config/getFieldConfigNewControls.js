import { ALLOWED_FIELD_TYPES } from "../../../constant";

const getFieldConfigNewControls = ({
	parsedCSVData = [],
	filteredCsvFieldOptions = () => [],
	firstRowAsHeader = "Yes",
}) => {
	const rowHeaders = parsedCSVData?.[0] || [];

	const controls = [
		{
			name: "first_row_as_header",
			label: "Do you wish to treat 1st row of your data as a field header?",
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
			name: "fields",
			type: "fieldArray",
			showFirstFieldDelete: false,
			addButtonLabel: "ADD FIELD",
			addButtonColour: "#212121",
			focusFieldName: "field_select",
			variant: "black-text",
			size: "medium",
			getAppendValue: (fields = []) => {
				const nextIndex = fields.length + 1;
				return {
					field_select: null,
					field_text: `Field ${nextIndex}`,
					type: { label: "Short Text", value: "SHORT_TEXT" },
				};
			},
			controls: [
				{
					name: "field_select",
					type: "select",
					isOptionEqualToValue: (option, selectedValue) =>
						option.value === selectedValue.value,
					getOptionLabel: (option) => option?.label || "",
					searchable: true,
					getDynamicOptions: (selectedValue) => {
						const baseOptions = filteredCsvFieldOptions();

						// Add current value if missing
						if (
							selectedValue &&
							!baseOptions.some(
								(opt) => opt.value === selectedValue,
							)
						) {
							const label =
								selectedValue.split("_")[1] || selectedValue;

							baseOptions.push({
								label,
								value: selectedValue,
							});
						}

						return baseOptions;
					},

					show: firstRowAsHeader === "Yes",
					textFieldProps: { placeholder: "Select a field" },
					rules: {
						required: "Select a CSV Column",
					},
					span: 6,
				},
				{
					name: "field_text",
					type: "text",
					placeholder: "Enter field name",
					defaultValue: `Field ${rowHeaders.length + 1}`,
					show: firstRowAsHeader === "No",
					rules: {
						required: "Field name is required",
					},
					span: 6,
				},
				{
					name: "type",
					type: "select",
					isOptionEqualToValue: (option, selectedValue) =>
						option.value === selectedValue.value,
					searchable: true,
					options: ALLOWED_FIELD_TYPES,
					defaultValue: ALLOWED_FIELD_TYPES[0],
					rules: {
						required: "Select field type",
					},
					span: 6,
				},
			],
		},
	];

	return controls;
};

export default getFieldConfigNewControls;
