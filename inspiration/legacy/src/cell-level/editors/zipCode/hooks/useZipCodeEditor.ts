import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
	getAllCountryCodes,
	COUNTRIES,
} from "../../../renderers/phoneNumber/utils/countries";
import { getZipCodePattern } from "../../../renderers/zipCode/utils/zipCodePatterns";

export interface ZipCodeValue {
	countryCode: string;
	zipCode: string;
}

interface UseZipCodeEditorProps {
	initialValue: ZipCodeValue | null;
}

const sanitizeZipCode = (value: string) => {
	return value.replace(/[^A-Za-z0-9\s-]/g, "").toUpperCase();
};

export const useZipCodeEditor = ({ initialValue }: UseZipCodeEditorProps) => {
	const parsedValue =
		initialValue ?? {
			countryCode: "",
			zipCode: "",
		};

	const [currentValue, setCurrentValue] =
		useState<ZipCodeValue>(parsedValue);
	const [popover, setPopover] = useState(false);
	const [search, setSearch] = useState("");

	const zipCodeInputRef = useRef<HTMLInputElement>(null);
	const countryInputRef = useRef<HTMLDivElement>(null);
	const selectedCountryRef = useRef<HTMLDivElement>(null);
	const searchFieldRef = useRef<HTMLInputElement>(null);

	const patternConfig = useMemo(
		() => getZipCodePattern(currentValue.countryCode),
		[currentValue.countryCode],
	);

	const patternPlaceholder = useMemo(() => {
		if (!patternConfig.pattern) {
			return "Zip code";
		}
		return patternConfig.pattern
			.replace(/9/g, "0")
			.replace(/A/g, "A")
			.replace(/-/g, "-")
			.replace(/\s+/g, " ");
	}, [patternConfig.pattern]);

	const filteredCountries = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) {
			return getAllCountryCodes();
		}

		return getAllCountryCodes().filter((code) => {
			const country = COUNTRIES[code];
			if (!country) return false;

			return (
				country.countryName.toLowerCase().includes(query) ||
				country.countryCode.toLowerCase().includes(query)
			);
		});
	}, [search]);

	const iconName = popover ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	const handleZipCodeChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const formatted = sanitizeZipCode(event.target.value);
			setCurrentValue((prev) => ({
				...prev,
				zipCode: formatted,
			}));
		},
		[],
	);

	const handleCountryClick = useCallback((countryCode: string) => {
		setCurrentValue((prev) => ({
			...prev,
			countryCode,
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
			if (selectedCountryRef.current) {
				selectedCountryRef.current.scrollIntoView({
					block: "center",
					behavior: "instant",
				});
			}
		} else {
			zipCodeInputRef.current?.focus();
		}
	}, [popover]);

	return {
		currentValue,
		popover,
		search,
		iconName,
		patternPlaceholder,
		zipCodeInputRef,
		countryInputRef,
		selectedCountryRef,
		searchFieldRef,
		filteredCountries,
		setSearch,
		setPopover,
		handleZipCodeChange,
		handleCountryClick,
		handleInputFocus,
	};
};

