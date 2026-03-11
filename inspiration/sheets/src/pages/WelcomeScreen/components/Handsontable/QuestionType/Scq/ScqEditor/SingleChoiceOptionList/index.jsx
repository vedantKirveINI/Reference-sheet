import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSRadio from "oute-ds-radio";
import ODSTextField from "oute-ds-text-field";
import React from "react";

import useScqOptionListHandler from "./hooks/useScqOptionListHandler";
import styles from "./styles.module.scss";

function SingleChoiceOptionList({
	options = [],
	initialSelectedOption = "",
	handleSelectOption = () => {},
}) {
	const {
		selectedOption = [],
		setSelectedOption = () => {},
		filteredOptions = [],
		searchValue = "",
		setSearchValue = () => {},
		searchFieldRef,
	} = useScqOptionListHandler({ initialSelectedOption, options });

	return (
		<div className={styles.option_list_wrapper}>
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
					filteredOptions.map((option, idx) => {
						return (
							<div
								key={`${option}_${idx}`}
								className={styles.radio_option_wrapper}
								onClick={() => {
									setSelectedOption(option);
									handleSelectOption(option);
								}}
							>
								<ODSRadio
									labelText={option}
									labelProps={{
										variant: "subtitle1",
									}}
									formControlLabelProps={{
										value: option,
										sx: { width: "100%" },
									}}
									radioProps={{
										checked: selectedOption === option,
										size: "small",
										sx: {
											"&.Mui-checked": {
												color: "#212121",
											},
										},
									}}
								/>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

export default SingleChoiceOptionList;
