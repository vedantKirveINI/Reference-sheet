import { countries } from "@oute/oute-ds.core.constants";
import React, { forwardRef } from "react";

import styles from "./styles.module.scss";

function CountryItem(
	{
		codeOfCountry = "IN",
		onClick = () => {},
		showCountryNumber = false,
		showCurrencySymbol = false,
		showCurrencyCode = false,
		isCountrySelected = false,
	},
	ref,
) {
	const country = countries[codeOfCountry || "IN"];

	const countryCode = (country?.countryCode || "IN").toLowerCase();

	const {
		countryName = "India",
		countryNumber = "91",
		currencySymbol = "₹",
		currencyCode = "INR",
	} = country;

	return (
		<div
			ref={ref}
			className={`${styles.country_details} ${isCountrySelected ? styles.selected_country : ""}`}
			onClick={() => onClick(codeOfCountry)}
		>
			<img
				src={`https://flagcdn.com/256x192/${countryCode}.png`}
				alt="country-flag"
				className={styles.country_flag}
				data-testid={`country-flag-${countryCode}`}
			/>

			{showCurrencyCode && (
				<span
					className={styles.currency_code}
					data-testid={`currency-code-${currencyCode}`}
				>
					({currencyCode})
				</span>
			)}

			<span
				className={styles.country_name}
				data-testid={`country-name-${countryName}`}
			>
				{countryName}
			</span>

			{showCountryNumber && (
				<span
					className={styles.country_number}
					data-testid={`country-code-${countryNumber}`}
				>
					+ {countryNumber}
				</span>
			)}

			{showCurrencySymbol && (
				<span
					className={styles.currency_symbol}
					data-testid={`currency-symbol-${currencySymbol}`}
				>
					{currencySymbol}
				</span>
			)}
		</div>
	);
}

export default forwardRef(CountryItem);
