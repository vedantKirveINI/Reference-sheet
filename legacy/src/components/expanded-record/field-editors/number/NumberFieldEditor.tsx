// Number Field Editor for Expanded Record
// Number input for numeric fields

import React, { useState, useEffect } from "react";
import ODSTextField from "oute-ds-text-field";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";

/**
 * NumberFieldEditor - Number input editor for numeric fields
 */
export const NumberFieldEditor: React.FC<IFieldEditorProps> = ({
	value,
	onChange,
	readonly = false,
}) => {
	const [localValue, setLocalValue] = useState<string>(() => {
		if (value === null || value === undefined) return "";
		return String(value);
	});

	// Update local value when prop value changes
	useEffect(() => {
		if (value === null || value === undefined) {
			setLocalValue("");
		} else {
			setLocalValue(String(value));
		}
	}, [value]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setLocalValue(newValue);

		// Convert to number if valid, otherwise pass empty string
		if (newValue === "") {
			onChange(null);
		} else {
			const numValue = Number(newValue);
			if (!isNaN(numValue)) {
				onChange(numValue);
			}
		}
	};

	return (
		<ODSTextField
			type="number"
			value={localValue}
			onChange={handleChange}
			disabled={readonly}
			placeholder="Enter number..."
			fullWidth
			sx={{
				"& .MuiInputBase-input": {
					fontSize: "0.875rem",
					fontFamily: "Inter, sans-serif",
					padding: "0.5rem 0.75rem",
				},
				"& .MuiOutlinedInput-root": {
					borderRadius: "0.375rem",
					backgroundColor: readonly ? "#f5f5f5" : "#ffffff",
				},
			}}
		/>
	);
};
