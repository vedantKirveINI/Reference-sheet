const getMcqControls = () => {
	const controls = [
		{
			name: "options",
			label: "Options",
			type: "fieldArray",
			variant: "black-text",
			focusFieldName: "label",
			controls: [
				{
					name: "label",
					label: "Label",
					placeholder: "Enter option",
					type: "text",
					rules: {
						required: "Enter a value",
					},
					addOnEnter: true,
				},
			],
		},
		// {
		// 	name: "defaultValue",
		// 	label: "Default Value",
		// 	placeholder: "Select default value (optional)",
		// 	type: "select",
		// 	multiple: true,
		// 	searchable: true,
		// 	options: [],
		// 	textFieldProps: {
		// 		placeholder: "Select default value (optional)",
		// 	},
		// 	isOptionEqualToValue: (option, value) =>
		// 		option?.label === value?.label,
		// 	filterSelectedOptions: false,
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

export default getMcqControls;
