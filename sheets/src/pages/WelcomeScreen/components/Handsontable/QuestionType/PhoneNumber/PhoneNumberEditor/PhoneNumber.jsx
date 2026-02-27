import isEmpty from "lodash/isEmpty";
import Icon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import ODSTextField from "oute-ds-text-field";
import { forwardRef } from "react";
import InputMask from "react-input-mask";

import CountryItem from "../../../../../../../components/CountryItem";
import usePhoneNumberEditor from "../hooks/usePhoneNumberEditor";

import styles from "./styles.module.scss";

function PhoneNumber(
	{ initialValue = "", onChange = () => {}, superClose = () => {} },
	ref,
) {
	const {
		value = {},
		search = "",
		iconName = "",
		popover = false,
		phoneNumberInputRef,
		filteredCountries = [],
		setSearch = () => {},
		setPopover = () => {},
		pattern = "",
		handleCountryClick = () => {},
		handleKeyDown = () => {},
		handlePhoneNumberChange = () => {},
		closePopover = () => {},
		selectedCountryRef,
		handleInputFocus = () => {},
		searchFieldRef,
	} = usePhoneNumberEditor({
		initialValue,
		onChange,
		superClose,
	});

	const {
		countryCode = "",
		phoneNumber = "",
		countryNumber = "",
	} = value || {};

	return (
		<div
			ref={ref}
			className={styles.phone_number_container}
			data-testid="phone-number-editor"
		>
			<div className={styles.phone_number_input_container}>
				<div
					className={styles.country_input_container}
					onClick={() => {
						setPopover((prev) => !prev);
					}}
					data-testid="phone-number-editor-country-input"
				>
					{countryCode && (
						<img
							className={styles.country_flag}
							src={`https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`}
							loading="lazy"
							alt="flag"
						/>
					)}

					{countryNumber && (
						<span className={styles.country_number}>
							+{countryNumber}
						</span>
					)}

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

				{pattern ? (
					<InputMask
						placeholder="299"
						mask={pattern}
						maskChar={null}
						value={phoneNumber || ""}
						onChange={handlePhoneNumberChange}
						onFocus={handleInputFocus}
					>
						{() => (
							<input
								onKeyDown={handleKeyDown}
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
						onFocus={handleInputFocus}
						onKeyDown={handleKeyDown}
						ref={phoneNumberInputRef}
						className={styles.phone_number_input}
						name="phoneNumber"
					/>
				)}
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
					placeholder="Search Country"
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
									showCountryNumber={true}
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

export default forwardRef(PhoneNumber);
