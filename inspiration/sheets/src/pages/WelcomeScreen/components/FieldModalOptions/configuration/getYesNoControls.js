// import YES_NO_OPTIONS from "../constants";

const getYesNoControls = () => {
	const controls = [
		// {
		// 	name: "other",
		// 	label: "Other",
		// 	type: "switch",
		// 	rules: {
		// 		required: false,
		// 	},
		// },
		// {
		// 	name: "defaultChoice",
		// 	label: "Default Value",
		// 	textFieldProps: { placeholder: "Select default value (optional)" },
		// 	type: "select",
		// 	options: YES_NO_OPTIONS,
		// 	disableClearable: false,
		// 	rules: {
		// 		required: false,
		// 	},
		// },
		{
			name: "description",
			label: "Description",
			placeholder: "Enter description (optional)",
			type: "text",
			rules: {
				required: false,
			},
		},
	];

	return controls;
};

export default getYesNoControls;
