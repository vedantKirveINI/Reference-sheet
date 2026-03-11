import isEmpty from "lodash/isEmpty";
import Icon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import ODSTextField from "oute-ds-text-field";
import React, { forwardRef } from "react";

import CountryItem from "../../../../../../../components/CountryItem";
import useCurrencyEditor from "../hooks/useCurrencyEditor";

import styles from "./styles.module.scss";

function Currency(
	{ initialValue = "", onChange = () => {}, superClose = () => {} },
	ref,
) {
	const {
		value = {},
		search = "",
		popover = false,
		currencyInputRef,
		iconName = "",
		filteredCountries = [],
		setPopover = () => {},
		setSearch = () => {},
		closePopover = () => {},
		handleKeyDown = () => {},
		handleCountryClick = () => {},
		validateInput = () => {},
		selectedCountryRef,
		handleInputFocus = () => {},
		searchFieldRef,
	} = useCurrencyEditor({
		initialValue,
		onChange,
		superClose,
	});

	const {
		currencyCode = "",
		currencySymbol = "",
		currencyValue = "",
		countryCode = "",
	} = value || {};

	return (
		<div
			className={styles.currency_container}
			ref={ref}
			data-testid="currency-editor"
		>
			<div className={styles.currency_input_container}>
				<div
					className={styles.country_input_container}
					onClick={() => {
						setPopover((prev) => !prev);
					}}
					data-testid="currency-editor-country-input"
				>
					{countryCode && (
						<img
							className={styles.country_flag}
							src={`https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`}
							loading="lazy"
							alt="flag"
						/>
					)}

					<span>{currencyCode}</span>
					<span>{currencySymbol}</span>

					<Icon
						outeIconName={iconName}
						outeIconProps={{
							sx: {
								width: "0.9375rem",
								height: "0.9375rem",
								color: "#000",
							},
						}}
					/>
				</div>

				<div className={styles.vertical_line} />

				<input
					ref={currencyInputRef}
					type="tel"
					className={styles.currency_value_input}
					placeholder="299"
					name="currencyValue"
					value={currencyValue}
					onChange={validateInput}
					onKeyDown={handleKeyDown}
					onFocus={handleInputFocus}
				/>
			</div>

			<ODSPopper
				className={styles.popover_container}
				open={popover}
				anchorEl={ref.current}
				placement="bottom-start"
				disablePortal
				onClose={closePopover}
			>
				<ODSTextField
					className="black"
					ref={searchFieldRef}
					placeholder="Search by country or currency"
					value={search}
					autoFocus={true}
					onChange={(e) => {
						setSearch(e.target.value);
					}}
					sx={{
						width: "100%",
					}}
					InputProps={{
						startAdornment: (
							<Icon
								outeIconName="OUTESearchIcon"
								outeIconProps={{
									sx: {
										height: "1.25rem",
										width: "1.25rem",
									},
								}}
							/>
						),
						endAdornment: search && (
							<Icon
								outeIconName="OUTECloseIcon"
								outeIconProps={{
									sx: {
										height: "1.25rem",
										width: "1.25rem",
										pointerEvents: "all !important", // pointer events is 'none' in ODS svgs
										cursor: "pointer",
									},
								}}
								buttonProps={{
									sx: {
										padding: 0,
									},
								}}
								onClick={() => {
									setSearch("");
									searchFieldRef.current.focus();
								}}
							/>
						),
					}}
				/>

				<div className={styles.countries_container}>
					{isEmpty(filteredCountries) ? (
						<div className={styles.option_not_found}>
							No options found
						</div>
					) : (
						filteredCountries.map((codeOfCountry) => {
							const isCountrySelected =
								codeOfCountry === countryCode;

							const countryRef = isCountrySelected
								? selectedCountryRef
								: null;

							return (
								<CountryItem
									key={codeOfCountry}
									ref={countryRef}
									codeOfCountry={codeOfCountry}
									onClick={handleCountryClick}
									showCurrencySymbol={true}
									showCurrencyCode={true}
									isCountrySelected={isCountrySelected}
								/>
							);
						})
					)}
				</div>
			</ODSPopper>
		</div>
	);
}

export default forwardRef(Currency);
