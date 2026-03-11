const controls = [
	// {
	// 	name: "presets",
	// 	label: "Presets",
	// 	type: "select",
	// 	textFieldProps: { placeholder: "Select preset" },
	// 	options: ["$1234", "$12.34", "$12.0M"],
	// 	disableClearable: false,
	// 	rules: {
	// 		required: false,
	// 	},
	// },
	// {
	// 	name: "decimalPlaces",
	// 	label: "Decimal Places",
	// 	type: "select",
	// 	textFieldProps: { placeholder: "Select decimal places" },
	// 	options: ["1 ($1.0)", "2 ($1.00)", "3 ($1.000)", "4 ($1.0000)"],
	// 	rules: {
	// 		required: false,
	// 	},
	// },
	// {
	// 	name: "thousandsAndDecimalSeparator",
	// 	label: "Thousands and decimal separators",
	// 	type: "select",
	// 	textFieldProps: { placeholder: "Select a separator" },
	// 	options: ["Comma, Period", "Space, Comma", "Period, Comma"],
	// 	rules: {
	// 		required: false,
	// 	},
	// },
	// {
	// 	name: "largeNumberAbbreviation",
	// 	label: "Large number abbreviation",
	// 	type: "select",
	// 	textFieldProps: { placeholder: "Select number abbreviation" },
	// 	options: ["Thoudsand (K)", "Million (M)", "Billion (B)"],
	// 	rules: {
	// 		required: false,
	// 	},
	// },
	// {
	// 	name: "showThousandsSeparators",
	// 	label: "Show thousands separators",
	// 	type: "switch",
	// 	rules: {
	// 		required: false,
	// 	},
	// },
	// {
	// 	name: "allowNegative",
	// 	label: "Allow negative numbers",
	// 	type: "switch",
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

const defaultControls = [
	// {
	// 	name: "defaultValue",
	// 	label: "Default Value",
	// 	placeholder: "Enter default value (optional)",
	// 	type: "text",
	// 	rules: {
	// 		required: false,
	// 		pattern: {
	// 			value: /^\d+(\.\d+)?$/,
	// 			message: "Only numeric values are allowed",
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

function getControls() {
	return {
		formattingControls: controls,
		defaultControls,
	};
}

export default getControls;
