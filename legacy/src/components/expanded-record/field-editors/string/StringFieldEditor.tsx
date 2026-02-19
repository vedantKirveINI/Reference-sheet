import React, { useState, useEffect } from "react";
import ODSTextField from "oute-ds-text-field";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";

/**
 * StringFieldEditor - Text input editor for string fields
 */
export const StringFieldEditor: React.FC<IFieldEditorProps> = ({
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
		onChange(newValue);
	};

	return (
		<ODSTextField
			value={localValue}
			onChange={handleChange}
			disabled={readonly}
			placeholder="Enter text..."
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
