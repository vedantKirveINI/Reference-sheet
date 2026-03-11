const getFileUploadControls = (values) => {
	const { description = "" } = values;

	const controls = [
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

export default getFileUploadControls;
