import { useEffect, useRef, useState } from "react";

import { getAssignedColours } from "../../../../../../../../utils/assignColours";
import useChipWidths from "../../../../QuestionType/Scq/hooks/useChipWidths";

function useScqFieldHandler({
	value = "",
	onChange = () => {},
	field = {},
	fieldIndex = 0,
}) {
	const [selectedOption, setSelectedOption] = useState(value);
	const [popperOpen, setPopperOpen] = useState(false);
	const containerRef = useRef(null);
	const popperContentRef = useRef(null);

	const { options = [] } = field || {};

	const { options: optionsList = [] } = options;

	const optionBackgroundColour = getAssignedColours(optionsList);

	const { borderRadius } = useChipWidths({
		selectionValue: selectedOption,
		availableWidth: containerRef.current?.offsetWidth || 0,
		wrapValue: "",
	});

	const handleSelectOption = (option) => {
		setSelectedOption(option);
		onChange(option);
	};

	const handlePopperContentClick = (e) => {
		e.stopPropagation();
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				popperOpen &&
				containerRef.current &&
				!containerRef.current.contains(event.target) &&
				popperContentRef.current &&
				!popperContentRef.current.contains(event.target)
			) {
				setPopperOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [popperOpen]);

	useEffect(() => {
		if (fieldIndex === 0 && containerRef.current) {
			containerRef.current.focus();
		}
	}, [fieldIndex]);

	return {
		selectedOption,
		popperOpen,
		containerRef,
		popperContentRef,
		optionBackgroundColour,
		borderRadius,
		handlePopperContentClick,
		handleSelectOption,
		setPopperOpen,
		optionsList,
	};
}

export default useScqFieldHandler;
