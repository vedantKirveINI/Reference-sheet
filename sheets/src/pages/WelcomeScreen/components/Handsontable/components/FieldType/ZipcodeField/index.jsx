import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSPopover from "oute-ds-popover";
import ODSTextField from "oute-ds-text-field";
import InputMask from "react-input-mask";

import CountryItem from "../../../../../../../components/CountryItem";
import { getZipCodePattern } from "../../../QuestionType/ZipCode/constant";

import useZipCodeEditor from "./hooks/useZipCodeEditor";
import styles from "./styles.module.scss";

const ZipcodeField = ({ value = "", onChange = () => {}, fieldIndex = 0 }) => {
	const {
		search = "",
		iconName = "",
		popover = false,
		filteredCountries = [],
		setSearch,
		setPopover,
		handleZipCodeChange = () => {},
		handleKeyDown = () => {},
		handleCountryClick = () => {},
		closePopover = () => {},
		zipCodeInputRef,
		selectedCountryRef,
		value: zipCodeValue,
		containerRef,
	} = useZipCodeEditor({
		initialValue: value,
		onChange,
		fieldIndex,
	});

	const { countryCode = "", zipCode = "" } = zipCodeValue || {};

	return (
		<div
			className={styles.zip_code_container}
			data-testid="zip-code-expanded-row"
			ref={containerRef}
		>
			<div className={styles.zip_code_input_container}>
				<div
					className={styles.country_flag_container}
					onClick={() => {
						setPopover((prev) => !prev);
					}}
					data-testid="zip-code-expanded-row-country-input"
				>
					{countryCode && (
						<img
							className={styles.country_flag}
							src={`https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`}
							loading="lazy"
							alt="flag"
						/>
					)}
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

				<div className={styles.vertical_line} />

				<InputMask
					mask={getZipCodePattern(countryCode)?.pattern}
					formatChars={getZipCodePattern(countryCode)?.formatChars}
					placeholder="299"
					maskChar={null}
					value={zipCode || ""}
					onChange={handleZipCodeChange}
				>
					{() => (
						<input
							onKeyDown={handleKeyDown}
							ref={zipCodeInputRef}
							className={styles.zip_code_input}
							name="zipCode"
						/>
					)}
				</InputMask>
			</div>

			<ODSPopover
				className={styles.popover_container}
				disablePortal={true}
				open={popover}
				anchorEl={containerRef?.current}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				onClose={closePopover}
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
			</ODSPopover>
		</div>
	);
};

export default ZipcodeField;
