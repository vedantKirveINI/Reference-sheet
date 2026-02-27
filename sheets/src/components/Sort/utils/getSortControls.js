import { ORDER_BY_OPTIONS_MAPPING } from "../constant";

const getSortControls = (values) => {
	const { filteredSortFieldOptions = () => {} } = values;

	const controls = [
		{
			name: "sortObjs",
			type: "fieldArray",
			showFirstFieldDelete: true,
			showOutSideDragIcon: true,
			showOutsideIcons: true,
			addButtonLabel: "ADD SORT",
			addButtonColour: "#212121",
			focusFieldName: "field",
			variant: "black-text",
			size: "medium",
			getAppendValue: () => ({
				field: null,
				order: ORDER_BY_OPTIONS_MAPPING[0],
			}),
			controls: [
				{
					name: "field",
					type: "select",
					isOptionEqualToValue: (option, selectedValue) =>
						option.value === selectedValue.value,
					getOptionLabel: (option) => option?.label || "",
					sx: { minWidth: 0 },
					searchable: true,
					options: filteredSortFieldOptions(),
					textFieldProps: { placeholder: "Select a field" },
					span: 6,
					rules: {
						required: "Select a column to sort by",
					},
				},
				{
					name: "order",
					type: "select",
					isOptionEqualToValue: (option, selectedValue) =>
						option.value === selectedValue.value,
					sx: { minWidth: 0 },
					options: ORDER_BY_OPTIONS_MAPPING,
					textFieldProps: { placeholder: "Select a value" },
					span: 4.5,
					rules: {
						required: "Order is Required",
					},
				},
			],
		},
	];

	return controls;
};

export default getSortControls;
