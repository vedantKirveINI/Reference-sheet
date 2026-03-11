import { useState, useMemo } from "react";

import { createRange } from "../../../../utils/helper";
import validateRating from "../../utils/validateRating";

function useRatingEditor({
	initialValue = "",
	onChange = () => {},
	cellProperties = {},
	superClose = () => {},
}) {
	const [isOpen, setIsOpen] = useState(false);

	const { fieldInfo = {} } = cellProperties?.cellProperties || {};

	const { maxRating } = fieldInfo?.options || {};

	// Validate initial value and set to null if invalid
	const [selectedRating, setSelectedRating] = useState(() => {
		const { isValid, processedValue } = validateRating({
			value: initialValue,
			maxRating,
		});
		return isValid ? processedValue : null;
	});

	// Generate rating options from 1 to maxRating
	const ratingOptions = useMemo(() => {
		return createRange(1, maxRating);
	}, [maxRating]);

	// Handle rating selection
	const handleChange = (value) => {
		setSelectedRating(() => value);
		onChange(value);
	};

	const handleKeyDown = (key) => {
		if (["Enter", "Tab"].includes(key.code)) {
			onChange(selectedRating);

			superClose();
		}
	};

	const handleOpen = () => {
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	return {
		selectedRating,
		ratingOptions,
		handleChange,
		maxRating,
		handleKeyDown,
		isOpen,
		handleOpen,
		handleClose,
	};
}

export default useRatingEditor;
