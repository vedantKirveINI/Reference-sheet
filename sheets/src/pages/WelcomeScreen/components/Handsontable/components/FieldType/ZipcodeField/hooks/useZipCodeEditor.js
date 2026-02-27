import { countries } from "@oute/oute-ds.core.constants";
import { useCallback, useRef, useState, useMemo, useEffect } from "react";

import validateAndParseZipCode from "../../../../QuestionType/ZipCode/utils/validateAndParseZipCode";

/**
 * Custom hook for managing zip code editor functionality
 * @param {Object} props - Hook props
 * @param {string} props.initialValue - Initial zip code value
 * @param {Function} props.onChange - Callback function when value changes
 * @returns {Object} Hook state and handlers
 */
const useZipCodeEditor = ({
	initialValue = "",
	onChange = () => {},
	fieldIndex = 0,
}) => {
	// Parse initial value and set up state
	const { parsedValue } = validateAndParseZipCode(initialValue);
	const [value, setValue] = useState(parsedValue);
	const [search, setSearch] = useState("");
	const [popover, setPopover] = useState(false);

	// Refs for DOM elements
	const containerRef = useRef();
	const zipCodeInputRef = useRef(null);
	const selectedCountryRef = useRef(null);

	// Memoized icon name based on popover state
	const iconName = useMemo(
		() => (popover ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon"),
		[popover],
	);

	// Memoized filtered countries based on search
	const filteredCountries = useMemo(
		() =>
			Object.keys(countries).filter((code) =>
				countries[code]?.countryName
					.toLowerCase()
					.includes(search.toLowerCase()),
			),
		[search],
	);

	/**
	 * Handles zip code input changes
	 * @param {Event} event - Input change event
	 */
	const handleZipCodeChange = useCallback(
		(event) => {
			const unMaskedValue = event.target.value;

			const newValue = {
				...value,
				zipCode: unMaskedValue,
			};

			setValue(newValue);

			if (!event.target.value) {
				onChange(null);
				return;
			}

			const newVal = {
				...value,
				zipCode: unMaskedValue,
				countryCode: value?.countryCode,
			};

			onChange(JSON.stringify(newVal));
		},
		[onChange, value],
	);

	/**
	 * Handles country selection
	 * @param {string} countryCode - Selected country code
	 */
	const handleCountryClick = useCallback(
		(countryCode) => {
			const countryDetails = countries[countryCode];

			setValue((prevState) => ({
				...prevState,
				countryCode: countryDetails.countryCode,
			}));

			if (value?.zipCode) {
				const newVal = {
					countryCode: countryDetails?.countryCode,
					zipCode: value?.zipCode,
				};
				onChange(JSON.stringify(newVal));
			}

			closePopover();
		},
		[onChange, value],
	);

	/**
	 * Handles key press events
	 * @param {KeyboardEvent} event - Keyboard event
	 */
	const handleKeyDown = useCallback((event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			setPopover(false);
		}
	}, []);

	/**
	 * Closes the country selection popover
	 */
	const closePopover = useCallback(() => {
		setPopover(false);
	}, []);

	/**
	 * Toggles the country selection popover
	 */
	const togglePopover = useCallback(() => {
		setPopover((prev) => !prev);
	}, []);

	/**
	 * Updates the search query
	 * @param {string} value - New search value
	 */
	const handleSearchChange = useCallback((value) => {
		setSearch(value);
	}, []);

	useEffect(() => {
		if (zipCodeInputRef.current && !popover && fieldIndex === 0) {
			zipCodeInputRef.current.focus();
		}

		if (selectedCountryRef.current && popover) {
			selectedCountryRef.current.scrollIntoView({
				behavior: "instant",
				block: "center",
			});
		}
	}, [popover]);

	return {
		// State
		value,
		search,
		iconName,
		popover,
		filteredCountries,

		// Refs
		zipCodeInputRef,
		selectedCountryRef,
		containerRef,

		// Handlers
		setSearch: handleSearchChange,
		setPopover: togglePopover,
		handleZipCodeChange,
		handleKeyDown,
		handleCountryClick,
		closePopover,
	};
};

export default useZipCodeEditor;
