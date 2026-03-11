import { countries } from "@oute/oute-ds.core.constants";
import { useCallback, useState, useRef, useEffect } from "react";

import { VALID_INTEGER_REGEX } from "../../../../../../../constants/regex";
import validateAndParseCurrency from "../utils/validateAndParseCurrency";

function useCurrencyEditor({
	initialValue = "",
	onChange = () => {},
	superClose = () => {},
}) {
	const { parsedValue: newValue = {} } =
		validateAndParseCurrency(initialValue);

	const [value, setValue] = useState(newValue);

	const [popover, setPopover] = useState(false);
	const [search, setSearch] = useState("");

	const currencyInputRef = useRef(null);
	const selectedCountryRef = useRef(null);
	const searchFieldRef = useRef(null);

	const iconName = popover ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	const validateInput = (e) => {
		if (VALID_INTEGER_REGEX.test(e.target.value)) {
			handleCurrencyValueChange(e);
		}
	};

	const handleCurrencyValueChange = (event) => {
		const newValue = {
			...value,
			[event.target.name]: event.target.value,
		};

		setValue(newValue);

		if (!event.target.value) {
			onChange(null);
			return;
		}

		onChange({
			...newValue,
			currencyValue: event.target.value,
			countryCode: newValue.countryCode,
			currencyCode: newValue.currencyCode,
			currencySymbol: newValue.currencySymbol,
		});
	};

	const handleKeyDown = (key) => {
		if (["Enter", "Tab"].includes(key.code)) {
			if (value?.currencyValue) {
				onChange({
					...value,
					countryCode: value.countryCode,
					currencyCode: value.currencyCode,
					currencySymbol: value.currencySymbol,
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

			closePopover();
		},
		[onChange, value],
	);

	const closePopover = () => {
		setPopover(() => false);
	};

	const handleInputFocus = useCallback(() => {
		if (popover) {
			closePopover();
		}
	}, [popover]);

	const filteredCountries = Object.keys(countries).filter((code) => {
		const country = countries[code];

		return (
			country.countryName.toLowerCase().includes(search.toLowerCase()) ||
			country.currencyCode.toLowerCase().includes(search.toLowerCase())
		);
	});

	useEffect(() => {
		// Only focus the input when popper is closed
		if (currencyInputRef.current && !popover) {
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
		currencyInputRef,
		value,
		search,
		iconName,
		popover,
		setPopover,
		setValue,
		setSearch,
		closePopover,
		filteredCountries,
		handleCountryClick,
		handleKeyDown,
		validateInput,
		handleCurrencyValueChange,
		selectedCountryRef,
		handleInputFocus,
		searchFieldRef,
	};
}

export default useCurrencyEditor;
