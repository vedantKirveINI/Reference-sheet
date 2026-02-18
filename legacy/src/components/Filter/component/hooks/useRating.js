import { useState, useMemo } from "react";

// import { createRange } from "../../../../pages/WelcomeScreen/components/Handsontable/utils/helper";

function useRating({ defaultValue, onChange = () => {}, maxRating = 10 }) {
	const [value, setValue] = useState(defaultValue);

	// const ratingOptions = useMemo(() => createRange(1, maxRating), [maxRating]);
	const ratingOptions = Array.from(
		{ length: maxRating },
		(_, index) => index + 1,
	);

	const handleChange = (value) => {
		const selectedOption = ratingOptions.find((option) => option === value);

		setValue(() => selectedOption);
		onChange(selectedOption);
	};

	return {
		value,
		handleChange,
		ratingOptions,
		setValue,
	};
}

export default useRating;
