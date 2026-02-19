import { useState, useCallback, useMemo, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IOpinionScaleCell } from "@/types";
import { validateOpinionScale } from "@/cell-level/renderers/opinion-scale/utils/validateOpinionScale";
import ODSAutocomplete from "oute-ds-autocomplete";
import ODSTextField from "oute-ds-text-field";
import styles from "./OpinionScaleFieldEditor.module.scss";

export const OpinionScaleFieldEditor: FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const opinionScaleCell = cell as IOpinionScaleCell | undefined;

	// Get options with defaults
	const fieldOptions = field.options as { maxValue?: number } | undefined;
	const maxValue =
		fieldOptions?.maxValue ?? opinionScaleCell?.options?.maxValue ?? 10;

	// Generate options from 1 to maxValue
	const options = useMemo(() => {
		return Array.from({ length: maxValue }, (_, i) => i + 1);
	}, [maxValue]);

	// Parse and validate current value
	const { processedValue } = useMemo(() => {
		return validateOpinionScale({
			value: (value ?? opinionScaleCell?.data) as
				| number
				| string
				| null
				| undefined,
			maxValue,
		});
	}, [value, opinionScaleCell?.data, maxValue]);

	const selectedValue = processedValue ?? null;

	// Dropdown open state
	const [isOpen, setIsOpen] = useState(false);

	// Handle value change
	const handleChange = useCallback(
		(_e: unknown, newValue: number | null) => {
			if (readonly) return;
			onChange(newValue);
			setIsOpen(false);
		},
		[onChange, readonly],
	);

	// Handle open/close
	const handleOpen = useCallback(() => {
		if (!readonly) {
			setIsOpen(true);
		}
	}, [readonly]);

	const handleClose = useCallback(() => {
		setIsOpen(false);
	}, []);

	// Format display value
	const displayValue =
		selectedValue !== null && selectedValue !== undefined
			? `${selectedValue}/${maxValue}`
			: "";

	return (
		<div data-testid="opinion-scale-expanded-row">
			<ODSAutocomplete
				open={isOpen}
				onOpen={handleOpen}
				onClose={handleClose}
				variant="black"
				fullWidth
				data-testid="opinion-scale-autocomplete"
				disablePortal={false}
				options={options}
				value={selectedValue}
				onChange={handleChange}
				disabled={readonly}
				getOptionLabel={(option) => option?.toString() ?? ""}
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
				renderInput={(params) => {
					return (
						<ODSTextField
							{...params}
							placeholder="Select a value"
							value={displayValue}
							InputProps={{
								...params.InputProps,
							}}
							inputProps={{
								...params.inputProps,
								readOnly: true,
								value: displayValue,
							}}
							sx={{
								width: "100%",
								".MuiInputBase-root": {
									borderRadius: "0.375rem",
								},
							}}
						/>
					);
				}}
			/>
		</div>
	);
};
