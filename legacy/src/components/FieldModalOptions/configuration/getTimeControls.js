const controls = [
	{
		name: "isTwentyFourHour",
		label: "24 hrs",
		type: "switch",
		rules: {
			required: false,
		},
	},
	// {
	// 	name: "defaultTime",
	// 	label: "Default Time",
	// 	type: "time",
	// 	question: {
	// 		settings: {
	// 			isTwentyFourHour: false,
	// 			defaultTime: { time: "", meridiem: "" },
	// 		},
	// 	},
	// 	rules: {
	// 		required: "Hey buddy",
	// 	},
	// 	span: 6,
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
