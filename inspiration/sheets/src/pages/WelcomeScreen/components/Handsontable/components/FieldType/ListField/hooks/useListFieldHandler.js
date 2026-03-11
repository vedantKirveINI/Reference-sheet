import { useEffect, useRef, useState } from "react";

const useListFieldHandler = ({ value = "", onChange }) => {
	// Parse initial value - assuming it's an array of strings
	const parseInitialValue = (value) => {
		if (!value) return [];

		try {
			const parsed = Array.isArray(value) ? value : JSON.parse(value);
			return Array.isArray(parsed) ? parsed : [];
		} catch (e) {
			return [];
		}
	};

	const initialSelectedOptions = parseInitialValue(value);

	// currentOptions: master list of all options (never remove from this)
	const [currentOptions, setCurrentOptions] = useState(
		initialSelectedOptions || [],
	);

	// selectedOptions: currently selected options (can change)
	const [selectedOptions, setSelectedOptions] = useState(
		initialSelectedOptions || [],
	);
	const [isOpen, setIsOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [filteredOptions, setFilteredOptions] = useState(
		initialSelectedOptions || [],
	);
	const containerRef = useRef(null);
	const popperRef = useRef(null);

	const handleSelectOption = (optionValue) => {
		// Update the selected options (what user has selected)
		setSelectedOptions(optionValue);

		// Also update the parent component
		onChange(JSON.stringify(optionValue));
	};

	// Function to add new option to currentOptions (master list)
	const handleAddNewOption = (newOption) => {
		if (newOption && !currentOptions.includes(newOption)) {
			// Add to master list (currentOptions)
			setCurrentOptions((prev) => [...prev, newOption]);

			// Also add to selected options
			setSelectedOptions((prev) => [...prev, newOption]);

			// Update parent
			onChange(JSON.stringify([...selectedOptions, newOption]));
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && searchValue.trim()) {
			e.preventDefault();
			// Check if the search value exists in filtered options
			const exactMatch = filteredOptions.find(
				(option) => option.toLowerCase() === searchValue.toLowerCase(),
			);

			if (!exactMatch) {
				// Add new option if it doesn't exist
				handleAddNewOption(searchValue.trim());
			} else {
				// Toggle existing option
				handleSelectOption(exactMatch);
			}
			setSearchValue("");
		}
	};

	const handleChipRemove = (optionToRemove) => {
		const newOptions = selectedOptions.filter(
			(option) => option !== optionToRemove,
		);
		handleSelectOption(newOptions);
	};

	const handlePopperContentClick = (e) => {
		// Don't toggle if click originated from popper
		if (popperRef.current?.contains(e.target)) {
			return;
		}
		setIsOpen((prev) => !prev);
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
			return currentOptions.filter((option) =>
				option.toLowerCase().includes(searchValue.toLowerCase()),
			);
		});
	}, [currentOptions, searchValue]);

	return {
		currentOptions, // Master list of all options (never remove)
		selectedOptions, // Currently selected options
		isOpen,
		searchValue,
		filteredOptions,
		containerRef,
		popperRef,
		setSearchValue,
		handleSelectOption,
		handleAddNewOption,
		handleKeyDown,
		handleChipRemove,
		handlePopperContentClick,
	};
};

export default useListFieldHandler;
