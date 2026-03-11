import isEmpty from "lodash/isEmpty";
import ODSCheckBox from "oute-ds-checkbox";
import ODSIcon from "oute-ds-icon";
import ODSTextField from "oute-ds-text-field";
import { useState, useEffect, useRef } from "react";

import { getDisplayValue, getItemKey, isOptionSelected } from "../utils/helper";

import styles from "./styles.module.scss";

function DropdownDynamicOptionList({
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
			return options.filter((option) => {
				const displayValue = getDisplayValue(option);
				return displayValue
					.toLowerCase()
					.includes(searchValue.toLowerCase());
			});
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
			<ODSTextField
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
						<ODSIcon
							outeIconName="OUTESearchIcon"
							outeIconProps={{
								sx: { height: "1.25rem", width: "1.25rem" },
							}}
						/>
					),
					endAdornment: searchValue && (
						<ODSIcon
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
					filteredOptions?.map((option, index) => {
						const displayValue = getDisplayValue(option);
						const itemKey = getItemKey({ item: option, index });
						const isSelected = isOptionSelected({
							option,
							selectedOptions,
						});

						return (
							<div
								key={itemKey}
								className={styles.checkbox_item}
								onClick={() => {
									setSelectedOptions((prev) => {
										let updatedOptions = [];
										if (isSelected) {
											// Remove option
											if (
												typeof option === "object" &&
												option?.label
											) {
												updatedOptions = prev.filter(
													(opt) =>
														opt?.label !==
														option?.label,
												);
											} else {
												updatedOptions = prev.filter(
													(opt) => opt !== option,
												);
											}
										} else {
											// Add option
											updatedOptions = [...prev, option];
										}

										handleSelectOption(updatedOptions);

										return updatedOptions;
									});
								}}
							>
								<ODSCheckBox
									labelText={displayValue}
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
									checked={isSelected}
								/>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

export default DropdownDynamicOptionList;
