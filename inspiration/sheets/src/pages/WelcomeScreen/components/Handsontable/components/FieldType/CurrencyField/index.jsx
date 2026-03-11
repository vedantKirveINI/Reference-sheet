import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSPopover from "oute-ds-popover";
import ODSTextField from "oute-ds-text-field";
import { memo } from "react";

import CountryItem from "../../../../../../../components/CountryItem";

import useCurrency from "./hooks/useCurrency";
import styles from "./styles.module.scss";

const CountrySelector = memo(
	({ countryCode, currencyCode, currencySymbol, iconName, onClick }) => (
		<div
			className={styles.country_input_container}
			onClick={onClick}
			data-testid="currency-expanded-row-country-input"
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
			<ODSIcon
				outeIconName={iconName}
				outeIconProps={{
					sx: {
						width: "1.5rem",
						height: "1.5rem",
						color: "#000",
					},
				}}
			/>
		</div>
	),
);

const SearchInput = memo(({ search, setSearch }) => (
	<ODSTextField
		fullWidth
		className="black"
		placeholder="Search Country"
		value={search}
		autoFocus={true}
		onChange={(e) => {
			setSearch(e.target.value);
		}}
		sx={{
			flex: 1,
			".MuiInputBase-root": {
				borderRadius: "0.375rem",
			},
		}}
		InputProps={{
			startAdornment: (
				<ODSIcon
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
				<ODSIcon
					outeIconName="OUTECloseIcon"
					outeIconProps={{
						sx: {
							height: "1.25rem",
							width: "1.25rem",
							pointerEvents: "all !important",
							cursor: "pointer",
						},
					}}
					onClick={() => setSearch("")}
				/>
			),
		}}
	/>
));

const CountriesList = memo(
	({
		filteredCountries,
		countryCode,
		selectedCountryRef,
		handleCountryClick,
	}) => (
		<div className={styles.countries_container}>
			{isEmpty(filteredCountries) ? (
				<div className={styles.option_not_found}>No options found</div>
			) : (
				filteredCountries.map((codeOfCountry) => {
					const isCountrySelected = codeOfCountry === countryCode;
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
	),
);

function CurrencyField({
	value: initialValue,
	onChange = () => {},
	fieldIndex = 0,
}) {
	const {
		containerRef,
		value,
		popover,
		search,
		selectedCountryRef,
		currencyInputRef,
		iconName,
		filteredCountries,
		onClose,
		setPopover,
		validateInput,
		setSearch,
		handleCountryClick,
	} = useCurrency({ initialValue, onChange, fieldIndex });

	const {
		currencyCode = "",
		currencySymbol = "",
		currencyValue = "",
		countryCode = "",
	} = value || {};

	return (
		<div
			className={styles.currency_container}
			ref={containerRef}
			data-testid="currency-expanded-row"
		>
			<div className={styles.currency_input_container}>
				<CountrySelector
					countryCode={countryCode}
					currencyCode={currencyCode}
					currencySymbol={currencySymbol}
					iconName={iconName}
					onClick={() => setPopover((prev) => !prev)}
				/>

				<div className={styles.vertical_line} />

				<input
					ref={currencyInputRef}
					type="tel"
					className={styles.currency_value_input}
					placeholder="299"
					name="currencyValue"
					value={currencyValue}
					onChange={validateInput}
				/>
			</div>

			<ODSPopover
				className={styles.popover_container}
				disablePortal={true}
				open={popover}
				anchorEl={containerRef?.current}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				onClose={onClose}
				slotProps={{
					paper: {
						sx: {
							padding: "0.5rem",
							borderRadius: "0.375rem",
							border: "0.0469rem solid #cfd8dc",
						},
					},
				}}
			>
				<SearchInput search={search} setSearch={setSearch} />
				<CountriesList
					filteredCountries={filteredCountries}
					countryCode={countryCode}
					selectedCountryRef={selectedCountryRef}
					handleCountryClick={handleCountryClick}
				/>
			</ODSPopover>
		</div>
	);
}

export default CurrencyField;
