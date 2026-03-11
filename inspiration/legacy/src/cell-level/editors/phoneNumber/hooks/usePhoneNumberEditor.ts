/**
 * Custom hook for Phone Number editor state management
 *
 * PATTERN REFERENCE: This hook follows the same pattern as StringEditor and McqEditor
 * - Updates LOCAL state immediately for UI feedback
 * - Does NOT call onChange immediately (prevents full page re-renders)
 * - onChange is called by parent component only on save events (Enter/Tab/blur)
 */
import { useState, useRef, useEffect, useCallback } from "react";
import {
	COUNTRIES,
	getCountry,
	getAllCountryCodes,
} from "../../../renderers/phoneNumber/utils/countries";

interface PhoneNumberValue {
	countryCode: string;
	countryNumber: string;
	phoneNumber: string;
}

interface UsePhoneNumberEditorProps {
	initialValue: PhoneNumberValue | null;
	containerWidth: number;
	containerHeight: number;
}

export const usePhoneNumberEditor = ({
	initialValue,
}: UsePhoneNumberEditorProps) => {
	// Parse initial value
	const parsedValue = initialValue || {
		countryCode: "",
		countryNumber: "",
		phoneNumber: "",
	};

	// Local state for phone number value (updates immediately for UI feedback)
	// PATTERN: Like StringEditor's `value` state - updates on every change but doesn't call onChange
	const [currentValue, setCurrentValue] =
		useState<PhoneNumberValue>(parsedValue);

	// Popover state for country selector
	const [popover, setPopover] = useState(false);

	// Search state for country filtering
	const [search, setSearch] = useState("");

	// Refs
	const phoneNumberInputRef = useRef<HTMLInputElement>(null);
	const selectedCountryRef = useRef<HTMLDivElement>(null);
	const searchFieldRef = useRef<HTMLInputElement>(null);

	// Get country pattern if available
	const country = getCountry(currentValue.countryCode);
	const pattern = country?.pattern || "";

	// Icon name based on popover state
	const iconName = popover ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	// Filter countries based on search
	const filteredCountries = getAllCountryCodes().filter((code) => {
		const country = COUNTRIES[code];
		if (!country) return false;
		return (
			country.countryName.toLowerCase().includes(search.toLowerCase()) ||
			country.countryNumber.includes(search)
		);
	});

	/**
	 * Handle phone number input change
	 * PATTERN: Updates local state immediately for UI feedback
	 * Does NOT call onChange - that's handled by parent on save events
	 */
	const handlePhoneNumberChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			// Remove non-numeric characters (for unmasked value)
			const unmaskedValue = event.target.value.replace(/\D/g, "");

			const newValue = {
				...currentValue,
				phoneNumber: unmaskedValue,
			};

			setCurrentValue(newValue);
			// NOTE: onChange is NOT called here - it's called by parent on save (Enter/Tab/blur)
		},
		[currentValue],
	);

	/**
	 * Handle country selection
	 * PATTERN: Updates local state immediately for UI feedback
	 * Does NOT call onChange - that's handled by parent on save events
	 */
	const handleCountryClick = useCallback(
		(countryCode: string) => {
			const country = getCountry(countryCode);
			if (!country) return;

			const newValue = {
				...currentValue,
				countryCode: country.countryCode,
				countryNumber: country.countryNumber,
			};

			setCurrentValue(newValue);
			setPopover(false);
			// NOTE: onChange is NOT called here - it's called by parent on save (Enter/Tab/blur)
		},
		[currentValue],
	);

	/**
	 * Close popover
	 */
	const closePopover = useCallback(() => {
		setPopover(false);
	}, []);

	/**
	 * Handle input focus - close popover if open
	 */
	const handleInputFocus = useCallback(() => {
		if (popover) {
			closePopover();
		}
	}, [popover, closePopover]);

	// Auto-focus phone number input when editor opens (and popover is closed)
	// Auto-focus search field when popover opens
	useEffect(() => {
		if (popover && searchFieldRef.current) {
			searchFieldRef.current.focus();
		} else if (phoneNumberInputRef.current && !popover) {
			phoneNumberInputRef.current.focus();
		}
	}, [popover]);

	// Scroll selected country into view when popover opens
	useEffect(() => {
		if (popover && selectedCountryRef.current) {
			selectedCountryRef.current.scrollIntoView({
				behavior: "instant",
				block: "center",
			});
		}
	}, [popover]);

	return {
		currentValue,
		search,
		iconName,
		popover,
		pattern,
		phoneNumberInputRef,
		selectedCountryRef,
		searchFieldRef,
		filteredCountries,
		setSearch,
		setPopover,
		handlePhoneNumberChange,
		handleCountryClick,
		closePopover,
		handleInputFocus,
	};
};
