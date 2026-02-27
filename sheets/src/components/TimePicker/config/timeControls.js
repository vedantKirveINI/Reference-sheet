const HOURS = [...Array(13).keys()];
const MINUTES = [...Array(60).keys()];

const timeControls = [
	{
		name: "hours",
		type: "select",
		searchable: true,
		options: HOURS,
		sx: { width: 70, minWidth: "unset" },
		textFieldProps: {
			placeholder: "HH",
		},
		ListboxProps: { style: { maxHeight: 150 } },
		getOptionLabel: (option) => option.toString().padStart(2, "0"),
		isOptionEqualToValue: (option, value) => {
			return option === value;
		},
	},
	{
		name: "minutes",
		type: "select",
		searchable: true,

		options: MINUTES,
		sx: { width: 70, minWidth: "unset" },
		textFieldProps: {
			placeholder: "MM",
		},
		ListboxProps: { style: { maxHeight: 150 } },
		getOptionLabel: (option) => option.toString().padStart(2, "0"),
		isOptionEqualToValue: (option, value) => {
			return option === value;
		},
	},
	{
		name: "meridiem",
		type: "select",
		options: ["AM", "PM"],
		sx: { width: 80, minWidth: "unset" },
		textFieldProps: {
			placeholder: "A",
		},
		ListboxProps: { style: { maxHeight: 250 } },
	},
];
export default timeControls;
