/**
 * CountryList component - displays searchable list of countries in a popover
 * Inspired by sheets project's country selector
 */
import React, { useEffect, useRef } from "react";
import { Icon } from "@/lib/oute-icon";
import { CountryItem } from "./CountryItem";

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

	useEffect(() => {
		if (searchFieldRef.current) {
			searchFieldRef.current.focus();
		}
	}, [searchFieldRef]);

	useEffect(() => {
		const countryContainer = countryContainerRef.current;
		if (!countryContainer) return;

		const handleWheel = (e: WheelEvent) => {
			e.stopPropagation();

			const { scrollTop, scrollHeight, clientHeight } = countryContainer;
			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

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
		<div className="flex flex-col w-full bg-white rounded overflow-hidden shadow-lg">
			<div className="relative p-2 border-b border-[#e0e0e0]">
				<div className="relative flex items-center">
					<span className="absolute left-2 text-[#637381] pointer-events-none">
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
					</span>
					<input
						ref={searchFieldRef}
						placeholder={searchPlaceholder}
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
						className="w-full pl-8 pr-8 py-2 border border-[#ddd] rounded text-sm outline-none focus:border-[#1976d2]"
					/>
					{search && (
						<button
							className="absolute right-2 bg-transparent border-none text-[#637381] cursor-pointer p-0 flex items-center justify-center hover:text-[#333]"
							onClick={() => {
								onSearchChange("");
								searchFieldRef.current?.focus();
							}}
							type="button"
						>
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
							/>
						</button>
					)}
				</div>
			</div>

			<div
				ref={countryContainerRef}
				className="py-4 max-h-[300px] overflow-y-auto overflow-x-hidden"
			>
				{filteredCountries.length === 0 ? (
					<div className="p-4 text-center text-[#666] text-sm">No options found</div>
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
