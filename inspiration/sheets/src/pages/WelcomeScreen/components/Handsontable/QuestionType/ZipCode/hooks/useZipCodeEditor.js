import { countries } from "@oute/oute-ds.core.constants";
import { useState, useCallback, useRef, useEffect } from "react";

import validateAndParseZipCode from "../utils/validateAndParseZipCode";

function useZipCodeEditor({
	initialValue = "",
	onChange = () => {},
	superClose = () => {},
}) {
	const { parsedValue } = validateAndParseZipCode(initialValue);

	const [value, setValue] = useState(parsedValue);
	const [search, setSearch] = useState("");
	const [popover, setPopover] = useState(false);

	const zipCodeInputRef = useRef(null);
	const selectedCountryRef = useRef(null);
	const searchFieldRef = useRef(null);

	const iconName = popover ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	const handleZipCodeChange = (event) => {
		const unMaskedValue = event.target.value;

		const newValue = {
			...value,
			[event.target.name]: unMaskedValue,
		};

		setValue(newValue);

		if (!event.target.value) {
			onChange(null);
			return;
		}

		onChange({
			...newValue,
			zipCode: unMaskedValue,
			countryCode: newValue.countryCode,
		});
	};

	const handleKeyDown = (key) => {
		if (["Enter", "Tab"].includes(key.code)) {
			if (value?.zipCode) {
				onChange({
					...value,
					countryCode: value.countryCode,
				});
			}

			superClose();
		}
	};

	const handleCountryClick = useCallback(
		(countryCode) => {
			const countryDetails = countries[countryCode];

			setValue((prevState) => ({
				...prevState,
				countryCode: countryDetails.countryCode,
			}));

			if (value?.zipCode) {
				onChange({
					countryCode: countryDetails?.countryCode,
					zipCode: value?.zipCode,
				});
			}

			closePopover();
		},
		[onChange, value],
	);

	const filteredCountries = Object.keys(countries).filter((code) =>
		countries[code]?.countryName
			.toLowerCase()
			.includes(search.toLowerCase()),
	);

	const closePopover = () => {
		setPopover(() => false);
	};

	const handleInputFocus = useCallback(() => {
		if (popover) {
			closePopover();
		}
	}, [popover]);

	useEffect(() => {
		// Only focus the input when popper is closed
		if (zipCodeInputRef.current && !popover) {
			zipCodeInputRef.current.focus();
		}

		if (popover && selectedCountryRef.current) {
			selectedCountryRef.current.scrollIntoView({
				behavior: "instant",
				block: "center",
			});
		}
	}, [popover]);

	return {
		value,
		search,
		popover,
		zipCodeInputRef,
		filteredCountries,
		setSearch,
		setPopover,
		handleZipCodeChange,
		handleKeyDown,
		handleCountryClick,
		iconName,
		closePopover,
		selectedCountryRef,
		handleInputFocus,
		searchFieldRef,
	};
}

export default useZipCodeEditor;
