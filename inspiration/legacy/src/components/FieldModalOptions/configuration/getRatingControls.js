import { createRange } from "@/utils/helper";

const maxRatingOptions = createRange(1, 10);

const getRatingControls = () => {
	const controls = [
		{
			name: "maxRating",
			label: "Max Rating",
			placeholder: "Enter max rating",
			type: "select",
			options: maxRatingOptions, // default max rating is 10
			defaultValue: 10,
			getOptionLabel: (option) => option.toString(),
			textFieldProps: { placeholder: "Select max rating" },
			rules: {
				required: true,
			},
			"data-testid": "max-rating",
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

export default getRatingControls;
