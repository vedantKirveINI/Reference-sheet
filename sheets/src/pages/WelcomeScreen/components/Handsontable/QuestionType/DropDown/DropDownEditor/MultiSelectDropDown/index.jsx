import { isEmpty } from "lodash";
import ODSAutocomplete from "oute-ds-autocomplete";
import CheckBox from "oute-ds-checkbox";
import ODSChip from "oute-ds-chip";
import Icon from "oute-ds-icon";
import TextField from "oute-ds-text-field";
import React from "react";

import getCustomSx from "./customStyles";
import styles from "./styles.module.scss";

function MultiSelectDropdown({
	value = [],
	options = [],
	onChange = () => {},
	applyBorder = false,
	popperMaxHeight = "18.75",
}) {
	const customStyles = getCustomSx({ popperMaxHeight, applyBorder });

	return (
		<ODSAutocomplete
			variant="black"
			multiple
			slotProps={{
				popper: {
					sx: customStyles.popperSx,
				},
			}}
			ListboxProps={{
				"data-testid": "ods-autocomplete-listbox",
				style: {
					maxHeight: `${popperMaxHeight}rem`,
					padding: "0.375rem",
					display: "flex",
					flexDirection: "column",
					gap: "0.375rem",
				},
			}}
			disablePortal={true}
			value={value}
			options={options}
			getOptionLabel={(option) => option?.label}
			isOptionEqualToValue={(option, value) => option.id === value.id}
			onChange={(e, val) => onChange(val)}
			sx={customStyles.autocompleteSx}
			renderTags={(value, getTagProps) => (
				<div className={styles.tags_container}>
					{value.map((option, index) => {
						const { key, ...tagProps } = getTagProps({ index });

						return (
							<ODSChip
								label={option?.label || ""}
								key={key}
								{...tagProps}
								size="small"
								deleteIcon={
									<Icon
										outeIconName="OUTECloseIcon"
										outeIconProps={{
											sx: customStyles.iconSx,
										}}
									/>
								}
								sx={customStyles.chipSx}
							/>
						);
					})}
				</div>
			)}
			renderOption={(props, option) => {
				const { key, id, ...rest } = props;

				const isSelected = value.some((val) => val?.id === option.id);

				return (
					<li key={key} {...rest}>
						<CheckBox
							key={id}
							sx={customStyles.checkboxSx}
							labelText={option?.label || ""}
							checked={isSelected}
							labelProps={{
								variant: "subtitle1",
								sx: {
									color: "inherit",
								},
							}}
						/>
					</li>
				);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					autoFocus
					placeholder={isEmpty(value) ? "Select Option" : ""}
				/>
			)}
		/>
	);
}

export default MultiSelectDropdown;
