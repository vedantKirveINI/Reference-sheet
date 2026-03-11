import { countries } from "@oute/oute-ds.core.constants";
import { useCallback, useEffect, useRef, useState } from "react";

import { REPLACE_NON_NUMBERS_REGEX } from "../../../../../../../constants/regex";
import validateAndParsePhoneNumber from "../utils/validateAndParsePhoneNumber";

function usePhoneNumberEditor({
	initialValue = "",
	onChange = () => {},
	superClose = () => {},
}) {
	const { parsedValue = {} } = validateAndParsePhoneNumber(initialValue);

	const [value, setValue] = useState(parsedValue);
	const [popover, setPopover] = useState(false);
	const [search, setSearch] = useState("");

	const phoneNumberInputRef = useRef(null);
	const selectedCountryRef = useRef(null);
	const searchFieldRef = useRef(null);

	const { pattern = "" } = countries[value?.countryCode] || {};
	const iconName = popover ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	const handlePhoneNumberChange = (event) => {
		const unMaskedValue = event.target.value.replace(
			REPLACE_NON_NUMBERS_REGEX,
			"",
		);

		const newValue = {
			...value,
			[event.target.name]: unMaskedValue,
		};

		setValue(newValue);

		if (!unMaskedValue) {
			onChange(null);
			return;
		}

		onChange({
			...newValue,
			countryNumber: newValue.countryNumber,
			countryCode: newValue.countryCode,
			phoneNumber: unMaskedValue,
		});
	};

	const handleKeyDown = (key) => {
		if (["Enter", "Tab"].includes(key.code)) {
			if (value?.phoneNumber) {
				onChange({
					...value,
					countryNumber: value.countryNumber,
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
				countryNumber: countryDetails.countryNumber,
			}));

			if (value?.phoneNumber) {
				onChange({
					countryCode: countryDetails?.countryCode,
					phoneNumber: value?.phoneNumber,
					countryNumber: countryDetails?.countryNumber,
				});
			}

			closePopover();
		},
		[onChange, value],
	);

	const filteredCountries = Object.keys(countries).filter(
		(code) =>
			countries[code]?.countryName
				.toLowerCase()
				.includes(search.toLowerCase()) ||
			countries[code]?.countryNumber.includes(search),
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
		if (phoneNumberInputRef.current && !popover) {
			phoneNumberInputRef.current.focus();
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
		iconName,
		popover,
		phoneNumberInputRef,
		filteredCountries,
		setSearch,
		setPopover,
		handlePhoneNumberChange,
		handleKeyDown,
		handleCountryClick,
		pattern,
		closePopover,
		selectedCountryRef,
		handleInputFocus,
		searchFieldRef,
	};
}

export default usePhoneNumberEditor;
