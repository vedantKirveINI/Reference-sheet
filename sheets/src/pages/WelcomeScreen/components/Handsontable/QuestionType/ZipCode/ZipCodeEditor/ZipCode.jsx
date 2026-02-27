import isEmpty from "lodash/isEmpty";
import Icon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import ODSTextField from "oute-ds-text-field";
import { forwardRef } from "react";
import InputMask from "react-input-mask";

import CountryItem from "../../../../../../../components/CountryItem";
import { getZipCodePattern } from "../constant";
import useZipCodeEditor from "../hooks/useZipCodeEditor";

import styles from "./styles.module.scss";

function ZipCode(
	{ initialValue = "", onChange = () => {}, superClose = () => {} },
	ref,
) {
	const {
		value = {},
		search = "",
		iconName = "",
		popover = false,
		zipCodeInputRef,
		filteredCountries = [],
		setSearch = () => {},
		setPopover = () => {},
		handleZipCodeChange = () => {},
		handleKeyDown = () => {},
		handleCountryClick = () => {},
		closePopover = () => {},
		selectedCountryRef,
		handleInputFocus = () => {},
		searchFieldRef,
	} = useZipCodeEditor({
		initialValue,
		onChange,
		superClose,
	});

	const { countryCode = "", zipCode = "" } = value || {};

	return (
		<div
			ref={ref}
			className={styles.zip_code_container}
			data-testid="zip-code-editor"
		>
			<div className={styles.zip_code_input_container}>
				<div
					className={styles.country_flag_container}
					onClick={() => {
						setPopover((prev) => !prev);
					}}
					data-testid="zip-code-editor-country-input"
				>
					{countryCode && (
						<img
							className={styles.country_flag}
							src={`https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`}
							loading="lazy"
							alt="flag"
						/>
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

				<InputMask
					mask={getZipCodePattern(countryCode)?.pattern}
					formatChars={getZipCodePattern(countryCode)?.formatChars}
					placeholder="299"
					maskChar={null}
					value={zipCode || ""}
					onChange={handleZipCodeChange}
					onFocus={handleInputFocus}
				>
					{() => {
						return (
							<input
								onKeyDown={handleKeyDown}
								ref={zipCodeInputRef}
								className={styles.zip_code_input}
								name="zipCode"
							/>
						);
					}}
				</InputMask>
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

export default forwardRef(ZipCode);
