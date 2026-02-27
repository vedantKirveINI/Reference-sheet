const getRankingControls = () => {
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
					placeholder: "Enter option to rank",
					type: "text",
					rules: {
						required: "Enter a value",
					},
					addOnEnter: true,
				},
			],
		},
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

export default getRankingControls;
