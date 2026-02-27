import isEmpty from "lodash/isEmpty";

import { FIELD_OPTIONS_MAPPING } from "../../../../../constants/fieldOptionsMapping";

const addFieldControls = ({ value = {} }) => {
	const controls = [
		{
			name: "name",
			type: "text",
			label: "Field Name",
			placeholder: "Enter field name",
			rules: {
				required: "Please enter a field name",
			},
		},
		{
			name: "type",
			type: "select",
			label: "Select Field",
			textFieldProps: { placeholder: "Select a field type" },
			disabled: !isEmpty(value),
			searchable: true,
			rules: {
				required: "Please select a field type",
			},
			options: FIELD_OPTIONS_MAPPING,
			isOptionEqualToValue: (option, selectedValue) =>
				option?.value === selectedValue?.value,
			sx: {
				width: "100%",
				".MuiInputBase-input": {
					...(!isEmpty(value) ? { cursor: "not-allowed" } : {}),
				},
			},
		},
	];

	return controls;
};

export default addFieldControls;
