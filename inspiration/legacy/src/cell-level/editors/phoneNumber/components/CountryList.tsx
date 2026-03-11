/**
 * CountryList component - displays searchable list of countries in a popover
 * Inspired by sheets project's country selector
 */
import React, { useEffect, useRef } from "react";
import Icon from "oute-ds-icon";
import ODSTextField from "oute-ds-text-field";
import { CountryItem } from "./CountryItem";
import styles from "./CountryList.module.css";

interface CountryListProps {
	filteredCountries: string[];
	selectedCountryCode: string;
	search: string;
	searchFieldRef: React.RefObject<HTMLInputElement>;
	onCountryClick: (countryCode: string) => void;
	selectedCountryRef: React.RefObject<HTMLDivElement>;
	onSearchChange: (value: string) => void;
	showCountryNumber?: boolean;
	showCurrencyCode?: boolean;
	showCurrencySymbol?: boolean;
	searchPlaceholder?: string;
}

export const CountryList: React.FC<CountryListProps> = ({
	filteredCountries,
	selectedCountryCode,
	search,
	searchFieldRef,
	onCountryClick,
	selectedCountryRef,
	onSearchChange,
	showCountryNumber = true,
	showCurrencyCode = false,
	showCurrencySymbol = false,
	searchPlaceholder = "Search Country",
}) => {
	const countryContainerRef = useRef<HTMLDivElement>(null);

	// Auto-focus search field when component mounts
	useEffect(() => {
		if (searchFieldRef.current) {
			searchFieldRef.current.focus();
		}
	}, [searchFieldRef]);

	// Handle mouse wheel scrolling in country list
	useEffect(() => {
		const countryContainer = countryContainerRef.current;
		if (!countryContainer) return;

		const handleWheel = (e: WheelEvent) => {
			// Stop propagation to prevent canvas scrolling
			e.stopPropagation();

			// Allow native scrolling within the container
			const { scrollTop, scrollHeight, clientHeight } = countryContainer;
			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

			// Prevent default only if we're at the boundary and scrolling in that direction
			if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
				e.preventDefault();
			}
		};

		countryContainer.addEventListener("wheel", handleWheel, {
			passive: false,
		});

		return () => {
			countryContainer.removeEventListener("wheel", handleWheel);
		};
	}, []);

	return (
		<div className={styles.country_list_container}>
			{/* Search field */}
			<div className={styles.search_container}>
				<ODSTextField
					className={styles.search_input}
					inputRef={searchFieldRef}
					placeholder={searchPlaceholder}
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					InputProps={{
						startAdornment: (
							<Icon
								outeIconName="OUTESearchIcon"
								outeIconProps={{
									sx: {
										width: "1rem",
										height: "1rem",
										color: "#637381",
									},
								}}
							/>
						),
						endAdornment: search ? (
							<Icon
								outeIconName="OUTECloseIcon"
								outeIconProps={{
									sx: {
										width: "1rem",
										height: "1rem",
										color: "#637381",
										cursor: "pointer",
									},
								}}
								onClick={() => {
									onSearchChange("");
									searchFieldRef.current?.focus();
								}}
							/>
						) : undefined,
					}}
				/>
			</div>

			{/* Countries list */}
			<div
				ref={countryContainerRef}
				className={styles.countries_container}
			>
				{filteredCountries.length === 0 ? (
					<div className={styles.no_options}>No options found</div>
				) : (
					filteredCountries.map((codeOfCountry) => {
						const isCountrySelected =
							codeOfCountry === selectedCountryCode;
						const countryRef = isCountrySelected
							? selectedCountryRef
							: null;

						return (
							<CountryItem
								key={codeOfCountry}
								ref={countryRef}
								codeOfCountry={codeOfCountry}
								onClick={onCountryClick}
								showCountryNumber={showCountryNumber}
								showCurrencyCode={showCurrencyCode}
								showCurrencySymbol={showCurrencySymbol}
								isCountrySelected={isCountrySelected}
							/>
						);
					})
				)}
			</div>
		</div>
	);
};
