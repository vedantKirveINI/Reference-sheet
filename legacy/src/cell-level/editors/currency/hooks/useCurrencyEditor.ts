import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
	COUNTRIES,
	getCountry,
	getAllCountryCodes,
} from "../../../renderers/phoneNumber/utils/countries";

export interface CurrencyValue {
	countryCode: string;
	currencyCode: string;
	currencySymbol: string;
	currencyValue: string;
}

interface UseCurrencyEditorProps {
	initialValue: CurrencyValue | null;
}

const DEFAULT_VALUE: CurrencyValue = {
	countryCode: "",
	currencyCode: "",
	currencySymbol: "",
	currencyValue: "",
};

const sanitizeCurrencyValue = (value: string) => {
	return value.replace(/[^\d.]/g, "");
};

export const useCurrencyEditor = ({
	initialValue,
}: UseCurrencyEditorProps) => {
	const parsedValue = initialValue ?? DEFAULT_VALUE;

	const [currentValue, setCurrentValue] =
		useState<CurrencyValue>(parsedValue);
	const [search, setSearch] = useState("");
	const [popover, setPopover] = useState(false);

	const currencyInputRef = useRef<HTMLInputElement>(null);
	const selectedCountryRef = useRef<HTMLDivElement>(null);
	const searchFieldRef = useRef<HTMLInputElement>(null);

	const filteredCountries = useMemo(() => {
		const query = search.trim().toLowerCase();
		const allCodes = getAllCountryCodes();
		if (!query) return allCodes;

		return allCodes.filter((code) => {
			const country = COUNTRIES[code];
			if (!country) return false;
			const currencyCode = country.currencyCode?.toLowerCase() ?? "";
			const currencySymbol = country.currencySymbol?.toLowerCase() ?? "";
			return (
				country.countryName.toLowerCase().includes(query) ||
				country.countryCode.toLowerCase().includes(query) ||
				currencyCode.includes(query) ||
				currencySymbol.includes(query)
			);
		});
	}, [search]);

	const iconName = popover ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	const handleCurrencyValueChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const sanitized = sanitizeCurrencyValue(event.target.value);
			setCurrentValue((prev) => ({
				...prev,
				currencyValue: sanitized,
			}));
		},
		[],
	);

	const handleCountryClick = useCallback((countryCode: string) => {
		const country = getCountry(countryCode);
		if (!country) return;

		setCurrentValue((prev) => ({
			...prev,
			countryCode: country.countryCode,
			currencyCode: country.currencyCode || prev.currencyCode,
			currencySymbol: country.currencySymbol || prev.currencySymbol,
		}));
		setPopover(false);
	}, []);

	const handleInputFocus = useCallback(() => {
		if (popover) {
			setPopover(false);
		}
	}, [popover]);

useEffect(() => {
	if (popover) {
		searchFieldRef.current?.focus();
		selectedCountryRef.current?.scrollIntoView({
			behavior: "instant",
			block: "center",
		});
	} else {
		currencyInputRef.current?.focus();
		currencyInputRef.current?.select();
	}
}, [popover]);

useEffect(() => {
	if (!popover) {
		currencyInputRef.current?.focus();
		currencyInputRef.current?.select();
	}
}, []);

	return {
		currentValue,
		search,
		popover,
		iconName,
		filteredCountries,
		currencyInputRef,
		selectedCountryRef,
		searchFieldRef,
		setSearch,
		setPopover,
		handleCurrencyValueChange,
		handleCountryClick,
		handleInputFocus,
	};
};

