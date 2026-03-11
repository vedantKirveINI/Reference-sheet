import { useEffect, useMemo, useRef, useState } from "react";

const useDynamicDropdownFieldHandler = ({
	value = "",
	onChange = () => {},
	field = {},
	fieldIndex = 0,
}) => {
	const optionsList = useMemo(
		() => field?.options?.options || [],
		[field?.options?.options],
	);

	let initialOptions = [];
	try {
		const parsedValue = JSON.parse(value);

		initialOptions = Array.isArray(parsedValue) ? parsedValue : [];
	} catch (e) {
		initialOptions = [];
	}

	const [currentOptions, setCurrentOptions] = useState(initialOptions);
	const [isOpen, setIsOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [filteredOptions, setFilteredOptions] = useState(optionsList);
	const containerRef = useRef(null);
	const popperRef = useRef(null);

	const handleSelectOption = (option) => {
		const newOptions = currentOptions.some(
			(opt) => opt?.label === option?.label,
		)
			? currentOptions.filter((opt) => opt?.label !== option?.label)
			: [...currentOptions, option];

		setCurrentOptions(newOptions);
		onChange(JSON.stringify(newOptions));
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target) &&
				popperRef.current &&
				!popperRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		setFilteredOptions(() => {
			return optionsList.filter((option) => {
				return option?.label
					?.toLowerCase()
					?.includes(searchValue.toLowerCase());
			});
		});
	}, [optionsList, searchValue]);

	useEffect(() => {
		if (fieldIndex === 0 && containerRef.current) {
			containerRef.current.focus();
		}
	}, [fieldIndex]);

	return {
		currentOptions,
		isOpen,
		searchValue,
		filteredOptions,
		containerRef,
		popperRef,
		setIsOpen,
		setSearchValue,
		handleSelectOption,
	};
};

export default useDynamicDropdownFieldHandler;
