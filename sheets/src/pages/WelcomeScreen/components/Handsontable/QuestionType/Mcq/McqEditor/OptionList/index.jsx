import isEmpty from "lodash/isEmpty";
import CheckBox from "oute-ds-checkbox";
import Icon from "oute-ds-icon";
import TextField from "oute-ds-text-field";
import { useState, useEffect, useRef } from "react";

import styles from "./styles.module.scss";

function OptionList({
	options = [],
	initialSelectedOptions = [],
	handleSelectOption = () => {},
}) {
	const [selectedOptions, setSelectedOptions] = useState(
		initialSelectedOptions,
	);
	const [filteredOptions, setFilteredOptions] = useState(options);
	const [searchValue, setSearchValue] = useState("");

	const searchFieldRef = useRef(null);

	useEffect(() => {
		setFilteredOptions(() => {
			return options.filter((option) =>
				option.toLowerCase().includes(searchValue.toLowerCase()),
			);
		});
	}, [options, searchValue]);

	// if options remove via chips cross icon
	useEffect(() => {
		setSelectedOptions(initialSelectedOptions);
	}, [initialSelectedOptions]);

	return (
		<div
			className={styles.option_list_container}
			onClick={(e) => e.stopPropagation()}
		>
			<TextField
				fullWidth
				className="black"
				ref={searchFieldRef}
				placeholder="Find your option"
				value={searchValue}
				autoFocus={true}
				onChange={(e) => {
					setSearchValue(e.target.value);
				}}
				sx={{
					flex: 1,

					".MuiInputBase-root": {
						borderRadius: "0.375rem",
					},
				}}
				InputProps={{
					startAdornment: (
						<Icon
							outeIconName="OUTESearchIcon"
							outeIconProps={{
								sx: { height: "1.25rem", width: "1.25rem" },
							}}
						/>
					),
					endAdornment: searchValue && (
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
								setSearchValue("");
								searchFieldRef.current.focus();
							}}
						/>
					),
				}}
			/>

			<div className={styles.option_container}>
				{isEmpty(filteredOptions) ? (
					<div className={styles.option_not_found}>
						No options found
					</div>
				) : (
					filteredOptions?.map((option, idx) => (
						<div
							key={`${option}_${idx}`}
							className={styles.checkbox_item}
							onClick={() => {
								setSelectedOptions((prev) => {
									let updatedOptions = [];
									if (prev.includes(option)) {
										updatedOptions = prev.filter(
											(opt) => opt !== option,
										);
									} else {
										updatedOptions = [...prev, option];
									}

									handleSelectOption(updatedOptions);

									return updatedOptions;
								});
							}}
						>
							<CheckBox
								labelText={option}
								labelProps={{
									variant: "body1",
									sx: {
										cursor: "pointer",
									},
								}}
								sx={{
									"&.Mui-checked": {
										color: "#212121",
									},
								}}
								checked={selectedOptions.includes(option)}
							/>
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default OptionList;
