import Icon from "oute-ds-icon";
import Radio from "oute-ds-radio";
import RadioGroup from "oute-ds-radio-group";
import React from "react";

import styles from "./styles.module.scss";

function SingleSelectDropDown(props) {
	const {
		currentOptions = [],
		setCurrentOptions = () => {},
		filteredOptions = [],
		onChange = () => {},
		search = "",
		setSearch = () => {},
	} = props;

	const handleChange = (event) => {
		const value = event.target.value;

		const selectedOption = filteredOptions.find(
			(option) => option.label === value,
		);

		setCurrentOptions(() => {
			return [selectedOption];
		});

		onChange(JSON.stringify([selectedOption]));
	};

	return (
		<>
			<div className={styles.container}>
				{(currentOptions || [])?.map((val) => {
					return (
						<div
							className={styles.edit_options_container}
							key={val?.id}
						>
							<div>{val?.label || "Option"}</div>
						</div>
					);
				})}
			</div>
			<div className={styles.autocomplete_container}>
				<div className={styles.search_wrapper}>
					<Icon
						outeIconName="OUTESearchIcon"
						outeIconProps={{
							sx: { height: "1.25rem", width: "1.25rem" },
						}}
					/>

					<input
						type="text"
						placeholder="Find your option"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
						}}
						className={styles.search_input}
					/>
				</div>

				<div className={styles.options_container}>
					<RadioGroup
						onChange={handleChange}
						row={false}
						value={currentOptions[0]?.label}
						sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}
					>
						{(filteredOptions || [])?.map((option) => (
							<label key={option?.id}>
								<Radio
									labelText={
										<div className={styles.option_label}>
											{option?.label}
										</div>
									}
									formControlLabelProps={{
										value: option?.label,
									}}
								/>
							</label>
						))}
					</RadioGroup>
				</div>
			</div>
		</>
	);
}

export default SingleSelectDropDown;
