// Number Field Editor for Expanded Record
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";

export const NumberFieldEditor: React.FC<IFieldEditorProps> = ({
	value,
	onChange,
	readonly = false,
}) => {
	const [localValue, setLocalValue] = useState<string>(() => {
		if (value === null || value === undefined) return "";
		return String(value);
	});

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
		<Input
			type="number"
			value={localValue}
			onChange={handleChange}
			disabled={readonly}
			placeholder="Enter number..."
			style={{
				width: "100%",
				fontSize: "0.875rem",
				fontFamily: "Inter, sans-serif",
				padding: "0.5rem 0.75rem",
				borderRadius: "0.375rem",
				backgroundColor: readonly ? "#f5f5f5" : "#ffffff",
			}}
		/>
	);
};
