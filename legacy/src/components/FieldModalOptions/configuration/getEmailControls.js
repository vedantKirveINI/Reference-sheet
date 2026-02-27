const controls = [
	// {
	// 	name: "defaultValue",
	// 	label: "Default Value",
	// 	placeholder: "Enter default value (optional)",
	// 	type: "text",
	// 	rules: {
	// 		required: false,
	// 		pattern: {
	// 			value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
	// 			message: "Please enter a valid email address",
	// 		},
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

export default controls;
