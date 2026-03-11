const getScqControls = () => {
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
		// 	textFieldProps: { placeholder: "Select default value (optional)" },
		// 	type: "select",
		// 	searchable: true,
		// 	options: [],
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

export default getScqControls;
