import ODSAutocomplete from "oute-ds-autocomplete";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import ODSTextField from "oute-ds-text-field";
import React, { forwardRef } from "react";

import { TEXT_WRAP_ICON_MAPPING, TEXT_WRAP_OPTIONS } from "./constants";
import useTextWrapper from "./hooks/useTextWrapper";
import styles from "./styles.module.scss";

function TextWrapper(
	{
		fields = [],
		textWrapped = {},
		setTextWrapped = () => {},
		socket = {},
		setView = () => {},
		columnMeta = "",
	},
	hotTableRef,
) {
	const {
		wrapValue = {},
		onWrapTextChange = () => {},
		isCellSelected = false,
	} = useTextWrapper({
		fields,
		socket,
		textWrapped,
		setTextWrapped,
		hotTableRef,
		setView,
		columnMeta,
	});

	return (
		<ODSAutocomplete
			data-outside-ignore="text-wrap-autocomplete"
			disabled={!isCellSelected}
			value={wrapValue}
			options={TEXT_WRAP_OPTIONS}
			variant="black"
			popupIcon={null}
			hideBorders={true}
			sx={{
				width: "9rem",
				"& .MuiOutlinedInput-root": {
					gap: "0.375rem",
					padding: "0.25rem 0.5rem !important",
				},
				"& .MuiOutlinedInput-root:hover": {
					backgroundColor: "#eceff1",
					cursor: "pointer",
				},
			}}
			slotProps={{
				popper: {
					sx: {
						"& .MuiAutocomplete-option": {
							padding: "0.75rem 0.5rem !important",
						},
						marginTop: "0.875rem !important",
					},
				},
			}}
			onChange={(e, val) => {
				onWrapTextChange(e, val);
			}}
			getOptionLabel={(option) => option?.label}
			isOptionEqualToValue={(option, value) =>
				option?.value === value?.value
			}
			renderOption={(props, option, { selected }) => {
				const { key, ...rest } = props;

				return (
					<li
						key={key}
						{...rest}
						style={{
							display: "flex",
							gap: "0.5rem",
							cursor: "pointer",
						}}
						data-outside-ignore="text-wrap-options"
					>
						<ODSIcon
							imageProps={{
								src: TEXT_WRAP_ICON_MAPPING[option?.value],
								className: selected
									? styles.selected_option_icon
									: styles.option_icon,
							}}
						/>
						<ODSLabel
							variant="subtitle2"
							sx={{ fontFamily: "Inter", fontWeight: "400" }}
							color={selected ? "white" : "#263238"}
						>
							{option.label}
						</ODSLabel>
					</li>
				);
			}}
			renderInput={(params) => {
				const selectedOption = TEXT_WRAP_OPTIONS.find(
					(option) => option.value === wrapValue?.value,
				);

				return (
					<ODSTextField
						{...params}
						className="black"
						InputProps={{
							...params.InputProps,
							startAdornment: (
								<ODSIcon
									imageProps={{
										src: TEXT_WRAP_ICON_MAPPING[
											selectedOption?.value
										],
										className: styles.option_icon,
									}}
								/>
							),
						}}
						inputProps={{
							...params.inputProps,
							readOnly: true,
							className: styles.text_wrap_label,
						}}
					/>
				);
			}}
		/>
	);
}

export default forwardRef(TextWrapper);
