const getTableControls = ({ handleSubmit, submit }) => {
	const controls = [
		{
			name: "name",
			label: "Table Name",
			type: "text",
			placeholder: "Enter Table Name",
			rules: {
				required: true,
			},
			autoFocus: true,
			onEnter: () => {
				handleSubmit(submit)();
			},
		},
	];

	return controls;
};

export default getTableControls;
