/**
 * CountryItem component - displays a country option in the country selector
 * Inspired by sheets project's CountryItem component
 */
import { forwardRef } from "react";
import {
	getCountry,
	getFlagUrl,
} from "../../../renderers/phoneNumber/utils/countries";
import styles from "./CountryItem.module.css";

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
				className={`${styles.country_item} ${isCountrySelected ? styles.selected : ""}`}
				onClick={() => onClick(codeOfCountry)}
			>
				<img
					className={styles.country_flag}
					src={getFlagUrl(country.countryCode)}
					alt={country.countryName}
					loading="lazy"
				/>
				{showCurrencyCode && country.currencyCode && (
					<span className={styles.currency_code}>
						({country.currencyCode})
					</span>
				)}
				<span className={styles.country_name}>{country.countryName}</span>
				{showCountryNumber && (
					<span className={styles.country_number}>
						+{country.countryNumber}
					</span>
				)}
				{showCurrencySymbol && country.currencySymbol && (
					<span className={styles.currency_symbol}>
						{country.currencySymbol}
					</span>
				)}
			</div>
		);
	},
);

CountryItem.displayName = "CountryItem";
