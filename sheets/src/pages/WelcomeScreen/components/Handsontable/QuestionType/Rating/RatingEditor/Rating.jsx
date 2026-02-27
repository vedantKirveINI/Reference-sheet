import ODSAutocomplete from "oute-ds-autocomplete";
import ODSTextField from "oute-ds-text-field";
import { forwardRef, useEffect } from "react";

import getSingleSelectCustomSx from "../../../../../../../components/Filter/component/common/SingleSelect/customStyles";

import useRatingEditor from "./hooks/useRatingEditor";
import styles from "./styles.module.scss";
import getRatingCustomSx from "./utils/getRatingCustomSx";

const customStyles = getSingleSelectCustomSx({ applyBorder: true });

function Rating(
	{
		initialValue = "",
		onChange = () => {},
		cellProperties = {},
		superClose = () => {},
		showEditorBorder = true,
		hidePopupIcon = true, // Default to true to hide popupIcon in editor
		disableClearable = false,
		autoOpen = true, // Default to true for editor
		autoFocus = false,
		disablePortal = true,
	},
	ref,
) {
	const {
		selectedRating,
		ratingOptions = [],
		handleChange = () => {},
		handleKeyDown = () => {},
		maxRating,
		isOpen,
		handleOpen,
		handleClose,
	} = useRatingEditor({
		initialValue,
		onChange,
		cellProperties,
		superClose,
	});

	const ratingCustomStyles = getRatingCustomSx({
		showEditorBorder,
	});

	// Auto-open the autocomplete dropdown when component mounts (if autoOpen is true)
	useEffect(() => {
		if (autoOpen) {
			handleOpen();
		}
	}, [autoOpen]);

	return (
		<div
			className={styles.rating_editor_container}
			ref={ref}
			data-testid="rating-editor"
			onKeyDown={handleKeyDown}
		>
			<ODSAutocomplete
				open={isOpen}
				onOpen={handleOpen}
				onClose={handleClose}
				variant="black"
				data-testid="rating-autocomplete"
				disablePortal={disablePortal}
				{...(hidePopupIcon && { popupIcon: null })}
				sx={ratingCustomStyles.autoCompleteSx}
				slotProps={{
					popper: {
						sx: {
							...customStyles.popperSx,
						},
					},
				}}
				ListboxProps={{
					"data-testid": "ods-autocomplete-listbox",
					style: {
						maxHeight: "18.75rem",
						padding: "0.375rem",
						display: "flex",
						flexDirection: "column",
						gap: "0.375rem",
					},
				}}
				getOptionLabel={(option) => option?.toString()}
				value={selectedRating || null}
				hideBorders={true}
				options={ratingOptions}
				onChange={(e, value) => {
					handleChange(value);
					handleClose();
				}}
				disableClearable={disableClearable}
				renderInput={(params) => {
					const displayValue = selectedRating
						? `${selectedRating}/${maxRating}`
						: "";

					return (
						<ODSTextField
							{...params}
							placeholder={"Select a rating"}
							autoFocus={autoFocus}
							value={displayValue}
							InputProps={{
								...params.InputProps,
							}}
							inputProps={{
								...params.inputProps,
								readOnly: true,
								value: displayValue,
							}}
						/>
					);
				}}
			/>
		</div>
	);
}

export default forwardRef(Rating);
