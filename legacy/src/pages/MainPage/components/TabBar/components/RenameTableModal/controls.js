const getRenameTableControls = () => {
	const controls = [
		{
			name: "name",
			label: "Table name",
			placeholder: "Enter table name",
			type: "text",
			rules: {
				required: "Table name is required",
			},
		},
	];

	return controls;
};

export default getRenameTableControls;
