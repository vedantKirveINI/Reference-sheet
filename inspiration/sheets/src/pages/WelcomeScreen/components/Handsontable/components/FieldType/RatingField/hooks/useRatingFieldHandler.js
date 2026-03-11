import { useState, useMemo, useCallback } from "react";

import validateRating from "../../../../QuestionType/Rating/utils/validateRating";
import { createRange } from "../../../../utils/helper";

const useRatingFieldHandler = ({
	value = "",
	onChange = () => {},
	field = {},
}) => {
	const { maxRating } = field?.options || {};

	const [selectedOption, setSelectedOption] = useState(() => {
		const { isValid, processedValue } = validateRating({
			value,
			maxRating,
		});
		return isValid ? processedValue : null; // avoid returning false on invalid
	});

	// Generate rating options based on max rating
	const ratingOptions = useMemo(() => {
		return createRange(1, maxRating);
	}, [maxRating]);

	const handleChange = useCallback(
		(value) => {
			setSelectedOption(() => value);
			onChange(value);
		},
		[onChange],
	);

	return {
		selectedOption,
		ratingOptions,
		handleChange,
	};
};

export default useRatingFieldHandler;
