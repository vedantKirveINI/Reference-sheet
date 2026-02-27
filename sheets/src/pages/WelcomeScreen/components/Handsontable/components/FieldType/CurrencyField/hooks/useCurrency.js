import { countries } from "@oute/oute-ds.core.constants";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

import { VALID_INTEGER_REGEX } from "../../../../../../../../constants/regex";
import validateAndParseCurrency from "../../../../QuestionType/Currency/utils/validateAndParseCurrency";

function useCurrency({ initialValue, onChange = () => {}, fieldIndex = 0 }) {
	const { parsedValue: newValue = {} } =
		validateAndParseCurrency(initialValue);

	const containerRef = useRef(null);
	const [value, setValue] = useState(newValue);
	const [popover, setPopover] = useState(false);
	const [search, setSearch] = useState("");
	const selectedCountryRef = useRef(null);
	const currencyInputRef = useRef(null);

	const iconName = useMemo(
		() => (popover ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon"),
		[popover],
	);

	const onClose = useCallback(() => {
		setPopover(false);
	}, []);

	const filteredCountries = useMemo(
		() =>
			Object.keys(countries).filter((code) => {
				const country = countries[code];
				return (
					country.countryName
						.toLowerCase()
						.includes(search.toLowerCase()) ||
					country.currencyCode
						.toLowerCase()
						.includes(search.toLowerCase())
				);
			}),
		[search],
	);

	const handleCurrencyValueChange = useCallback(
		(event) => {
			setValue((prevState) => ({
				...prevState,
				[event.target.name]: event.target.value,
			}));

			if (!event.target.value) {
				onChange(null);
				return;
			}

			const newValue = {
				...value,
				currencyValue: event.target.value,
				countryCode: value?.countryCode,
				currencyCode: value?.currencyCode,
				currencySymbol: value?.currencySymbol,
			};

			onChange(JSON.stringify(newValue));
		},
		[value, onChange],
	);

	const validateInput = useCallback(
		(e) => {
			if (VALID_INTEGER_REGEX.test(e.target.value)) {
				handleCurrencyValueChange(e);
			}
		},
		[handleCurrencyValueChange],
	);

	const handleCountryClick = useCallback(
		(countryCode) => {
			const countryDetails = countries[countryCode];

			setValue((prevState) => ({
				...prevState,
				countryCode: countryDetails.countryCode,
				currencyCode: countryDetails.currencyCode,
				currencySymbol: countryDetails.currencySymbol,
			}));

			if (value?.currencyValue) {
				onChange({
					countryCode: countryDetails?.countryCode,
					currencyCode: countryDetails?.currencyCode,
					currencySymbol: countryDetails?.currencySymbol,
					currencyValue: value?.currencyValue,
				});
			}
			onClose();
		},
		[onChange, value, onClose],
	);

	useEffect(() => {
		if (currencyInputRef.current && !popover && fieldIndex === 0) {
			currencyInputRef.current.focus();
		}

		if (popover && selectedCountryRef.current) {
			selectedCountryRef.current.scrollIntoView({
				behavior: "instant",
				block: "center",
			});
		}
	}, [popover]);

	return {
		containerRef,
		value,
		popover,
		search,
		selectedCountryRef,
		iconName,
		filteredCountries,
		onClose,
		setPopover,
		validateInput,
		setSearch,
		handleCountryClick,
		currencyInputRef,
	};
}

export default useCurrency;
