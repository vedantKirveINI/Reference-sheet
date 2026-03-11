const getDateControls = () => {
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
		},
		// {
		// 	name: "defaultValue",
		// 	label: "Default Value",
		// 	placeholder: "Enter default value (optional)",
		// 	type: "dateTime",
		// 	sx: {
		// 		"& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
		// 			{
		// 				borderColor: "#212121",
		// 			},
		// 	},
		// 	separator: "/",
		// 	dateFormat: "DDMMYYYY",
		// 	sx: {
		// 		"& .MuiOutlinedInput-root": {
		// 			"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
		// 				borderColor: "#212121",
		// 			},
		// 		},
		// 	},
		// 	includeTime: false,
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

export default getDateControls;
