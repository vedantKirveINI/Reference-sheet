import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSPopover from "oute-ds-popover";
import ODSTextField from "oute-ds-text-field";
import { useRef, useMemo, useCallback, memo } from "react";
import InputMask from "react-input-mask";

import CountryItem from "../../../../../../../components/CountryItem";

import usePhoneNumberField from "./hooks/usePhoneNumberField";
import styles from "./styles.module.scss";

const CountrySelector = memo(
	({ countryCode, countryNumber, popover, onToggle }) => {
		const getCountryFlagUrl = useCallback(() => {
			const code = countryCode?.toLowerCase();
			return `https://flagcdn.com/256x192/${code}.png`;
		}, [countryCode]);

		return (
			<div className={styles.country_input_container} onClick={onToggle}>
				{countryCode && (
					<img
						className={styles.country_flag}
						src={getCountryFlagUrl()}
						loading="lazy"
						alt="flag"
					/>
				)}
				{countryNumber && (
					<span className={styles.country_number}>
						+{countryNumber}
					</span>
				)}
				<ODSIcon
					outeIconName={
						popover ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon"
					}
					outeIconProps={{
						sx: {
							width: "1.5rem",
							height: "1.5rem",
							color: "#000",
						},
					}}
				/>
			</div>
		);
	},
);

const CountrySearch = memo(({ search, onSearchChange }) => (
	<ODSTextField
		fullWidth
		className="black"
		placeholder="Search Country"
		value={search}
		autoFocus={true}
		onChange={(e) => {
			onSearchChange(e.target.value);
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
					onClick={() => onSearchChange("")}
				/>
			),
		}}
	/>
));

const CountryList = memo(
	({
		filteredCountries,
		countryCode,
		onCountryClick,
		selectedCountryRef,
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
							onClick={onCountryClick}
							showCountryNumber={true}
							isCountrySelected={isCountrySelected}
						/>
					);
				})
			)}
		</div>
	),
);

const PhoneNumberField = ({
	value = "",
	onChange = () => {},
	fieldIndex = 0,
}) => {
	const containerRef = useRef(null);

	const {
		search,
		popover,
		filteredCountries,
		pattern,
		phoneNumberInputRef,
		selectedCountryRef,
		countryCode,
		phoneNumber,
		countryNumber,
		setSearch,
		setPopover,
		handleCountryClick,
		handlePhoneNumberChange,
		closePopover,
	} = usePhoneNumberField({
		value,
		onChange,
		fieldIndex,
	});

	const handleSearchChange = useCallback(
		(newSearch) => {
			setSearch(newSearch);
		},
		[setSearch],
	);

	const togglePopover = useCallback(() => {
		setPopover((prev) => !prev);
	}, [setPopover]);

	const popoverProps = useMemo(
		() => ({
			className: styles.popover_container,
			disablePortal: true,
			open: popover,
			anchorEl: containerRef?.current,
			anchorOrigin: { vertical: "bottom", horizontal: "left" },
			onClose: closePopover,
			slotProps: {
				paper: {
					sx: {
						padding: "0.5rem",
						borderRadius: "0.375rem",
						border: "0.0469rem solid #cfd8dc",
					},
				},
			},
		}),
		[popover, closePopover],
	);

	return (
		<div
			className={styles.phone_number_container}
			ref={containerRef}
			data-testid="phone-number-expanded-row"
		>
			<div className={styles.phone_number_input_container}>
				<CountrySelector
					countryCode={countryCode}
					countryNumber={countryNumber}
					popover={popover}
					onToggle={togglePopover}
				/>

				<div className={styles.vertical_line} />

				{pattern ? (
					<InputMask
						placeholder="299"
						mask={pattern}
						maskChar={null}
						value={phoneNumber || ""}
						onChange={handlePhoneNumberChange}
					>
						{() => (
							<input
								ref={phoneNumberInputRef}
								className={styles.phone_number_input}
								name="phoneNumber"
							/>
						)}
					</InputMask>
				) : (
					<input
						placeholder="299"
						value={phoneNumber || ""}
						onChange={handlePhoneNumberChange}
						ref={phoneNumberInputRef}
						className={styles.phone_number_input}
						name="phoneNumber"
					/>
				)}
			</div>

			<ODSPopover {...popoverProps}>
				<CountrySearch
					search={search}
					onSearchChange={handleSearchChange}
				/>
				<CountryList
					filteredCountries={filteredCountries}
					countryCode={countryCode}
					onCountryClick={handleCountryClick}
					selectedCountryRef={selectedCountryRef}
				/>
			</ODSPopover>
		</div>
	);
};

export default PhoneNumberField;
