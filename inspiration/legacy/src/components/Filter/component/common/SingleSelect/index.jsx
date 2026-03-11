import isEmpty from "lodash/isEmpty";
import ODSAutocomplete from "oute-ds-autocomplete";
import ODSChip from "oute-ds-chip";
import Radio from "oute-ds-radio";
import TextField from "oute-ds-text-field";

import getSingleSelectCustomSx from "./customStyles";

function SingleSelect({
	value = "",
	handleChange = () => {},
	options = [],
	popperMaxHeight = "18.75",
	defaultValue = "",
	applyBorder = false,
	disablePortal = false,
	optionBackgroundColor = {},
	chipFontSize = "var(--cell-font-size)",
	autoFocus = false,
}) {
	const correctValue = value || defaultValue;

	const customStyles = getSingleSelectCustomSx({
		popperMaxHeight,
		applyBorder,
	});

	return (
		<ODSAutocomplete
			variant="black"
			data-testid="single-select-autocomplete"
			sx={customStyles.autocompleteSx}
			disablePortal={disablePortal}
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
			value={
				options?.find((o) => o.value === correctValue) || correctValue
			}
			hideBorders={!applyBorder}
			options={options}
			onChange={(e, v) => {
				let val;
				if (typeof v === "object") {
					val = v.value;
				} else {
					val = v;
				}
				handleChange(val);
			}}
			disableClearable={true}
			renderOption={(props, option) => {
				const { key = "", ...rest } = props;

				return (
					<div key={key} {...rest}>
						<Radio
							labelText={
								typeof option === "object"
									? option.label
									: option
							}
							labelProps={{
								variant: "subtitle2",
								sx: customStyles.radioLabelProps,
							}}
							formControlLabelProps={{
								value:
									typeof option === "object"
										? option.value
										: option,
							}}
							radioProps={{
								checked:
									(typeof option === "object"
										? option.value
										: option) === correctValue,
								size: "small",
								sx: customStyles.radioProps,
							}}
						/>
					</div>
				);
			}}
			renderInput={(params) => {
				// Determine the label to display in the chip
				let selectedLabel;

				if (typeof options[0] === "object") {
					// Handle array of objects
					const selectedOption = options.find(
						(option) => option.value === correctValue,
					);

					selectedLabel = selectedOption
						? selectedOption.label
						: correctValue;
				} else {
					// Handle array of strings
					selectedLabel = correctValue;
				}

				params.inputProps.value = "";
				return (
					<TextField
						{...params}
						autoFocus={autoFocus}
						InputProps={{
							...params.InputProps,
							startAdornment: correctValue ? (
								<ODSChip
									size="small"
									label={selectedLabel} // Use the determined label
									sx={{
										maxWidth: "80%",
										background: isEmpty(
											optionBackgroundColor,
										)
											? "#DDC1FF"
											: `${optionBackgroundColor[correctValue]}`,

										"& .MuiChip-label": {
											color: "var(--cell-text-primary-color)",
											fontSize: chipFontSize,
											fontFamily: "var(--tt-font-family)",
											padding: "0rem",
											letterSpacing: "0.015rem",
										},
										...(applyBorder && {
											marginTop: "2px", // in px to maintain alignment across different screen sizes
										}),
									}}
								/>
							) : null,
						}}
						inputProps={{
							...params.inputProps,
							readOnly: true,
						}}
					/>
				);
			}}
		/>
	);
}

export default SingleSelect;
