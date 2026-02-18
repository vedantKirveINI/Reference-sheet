/**
 * CountryItem component - displays a country option in the country selector
 * Inspired by sheets project's CountryItem component
 */
import { forwardRef } from "react";
import {
	getCountry,
	getFlagUrl,
} from "../../../renderers/phoneNumber/utils/countries";

interface CountryItemProps {
	codeOfCountry: string;
	onClick: (countryCode: string) => void;
	showCountryNumber?: boolean;
	showCurrencySymbol?: boolean;
	showCurrencyCode?: boolean;
	isCountrySelected?: boolean;
}

export const CountryItem = forwardRef<HTMLDivElement, CountryItemProps>(
	(
		{
			codeOfCountry,
			onClick,
			showCountryNumber = true,
			showCurrencySymbol = false,
			showCurrencyCode = false,
			isCountrySelected = false,
		},
		ref,
	) => {
		const country = getCountry(codeOfCountry);
		if (!country) return null;

		return (
			<div
				ref={ref}
				className={`flex items-center gap-2 py-2 px-3 cursor-pointer transition-colors hover:bg-gray-100 ${isCountrySelected ? "bg-blue-50" : ""}`}
				onClick={() => onClick(codeOfCountry)}
			>
				<img
					className="w-5 h-[15px] object-cover rounded-sm flex-shrink-0"
					src={getFlagUrl(country.countryCode)}
					alt={country.countryName}
					loading="lazy"
				/>
				{showCurrencyCode && country.currencyCode && (
					<span className="text-xs text-[#90a4ae]">
						({country.currencyCode})
					</span>
				)}
				<span className="flex-1 text-sm text-[#333]">{country.countryName}</span>
				{showCountryNumber && (
					<span className="text-sm text-[#666] font-medium">
						+{country.countryNumber}
					</span>
				)}
				{showCurrencySymbol && country.currencySymbol && (
					<span className="text-sm text-[#424242] font-medium">
						{country.currencySymbol}
					</span>
				)}
			</div>
		);
	},
);

CountryItem.displayName = "CountryItem";
