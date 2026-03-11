import { countries } from "@oute/oute-ds.core.constants";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

import { REPLACE_NON_NUMBERS_REGEX } from "../../../../../../../../constants/regex";
import validateAndParsePhoneNumber from "../../../../QuestionType/PhoneNumber/utils/validateAndParsePhoneNumber";

const usePhoneNumberField = ({
	value = "",
	onChange = () => {},
	fieldIndex = 0,
}) => {
	const { parsedValue = {} } = validateAndParsePhoneNumber(value);

	const [localValue, setLocalValue] = useState(parsedValue);
	const [search, setSearch] = useState("");
	const [popover, setPopover] = useState(false);

	const phoneNumberInputRef = useRef(null);
	const selectedCountryRef = useRef(null);

	const currentCountry = useMemo(
		() => countries[localValue?.countryCode] || {},
		[localValue?.countryCode],
	);

	const { pattern = "" } = currentCountry || {};

	const closePopover = useCallback(() => {
		setPopover(false);
	}, []);

	const handlePhoneNumberChange = useCallback(
		(event) => {
			const unMaskedValue = event.target.value.replace(
				REPLACE_NON_NUMBERS_REGEX,
				"",
			);

			setLocalValue((prevState) => ({
				...prevState,
				[event.target.name]: unMaskedValue,
			}));

			if (!unMaskedValue) {
				onChange(null);
				return;
			}

			const val = {
				...localValue,
				countryNumber: localValue?.countryNumber,
				countryCode: localValue?.countryCode,
				phoneNumber: unMaskedValue,
			};

			onChange(JSON.stringify(val));
		},
		[localValue, onChange],
	);

	const handleCountryClick = useCallback(
		(countryCode) => {
			const countryDetails = countries[countryCode];

			if (!countryDetails) {
				console.error(`Invalid country code: ${countryCode}`);
				return;
			}

			setLocalValue((prevState) => ({
				...prevState,
				countryCode: countryDetails.countryCode,
				countryNumber: countryDetails.countryNumber,
			}));

			if (localValue?.phoneNumber) {
				onChange(
					JSON.stringify({
						countryCode: countryDetails.countryCode,
						phoneNumber: localValue?.phoneNumber,
						countryNumber: countryDetails.countryNumber,
					}),
				);
			}

			closePopover();
		},
		[onChange, localValue, closePopover],
	);

	const filteredCountries = useMemo(
		() =>
			Object.keys(countries).filter((code) => {
				const country = countries[code];
				const searchLower = search.toLowerCase();

				return (
					country?.countryName?.toLowerCase().includes(searchLower) ||
					country?.countryNumber?.includes(search)
				);
			}),
		[search],
	);

	useEffect(() => {
		if (phoneNumberInputRef.current && !popover && fieldIndex === 0) {
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
		search,
		popover,
		filteredCountries,
		pattern,
		phoneNumberInputRef,
		selectedCountryRef,
		countryCode: localValue?.countryCode,
		phoneNumber: localValue?.phoneNumber || "",
		countryNumber: localValue?.countryNumber,
		setSearch,
		setPopover,
		handleCountryClick,
		handlePhoneNumberChange,
		closePopover,
	};
};

export default usePhoneNumberField;
