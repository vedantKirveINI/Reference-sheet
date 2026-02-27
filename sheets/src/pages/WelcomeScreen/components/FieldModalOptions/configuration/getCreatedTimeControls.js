const getCreatedTimeControls = () => {
	const controls = [
		{
			name: "dateFormat",
			label: "Date Format",
			textFieldProps: { placeholder: "Select date format" },
			type: "select",
			options: ["DDMMYYYY", "MMDDYYYY", "YYYYMMDD"],
			rules: {
				required: false,
			},
		},
		{
			name: "includeTime",
			type: "switch",
			label: "Include Time",
			defaultValue: true,
			labelProps: {
				sx: {
					fontSize: "0.85rem",
				},
			},
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

export default getCreatedTimeControls;
