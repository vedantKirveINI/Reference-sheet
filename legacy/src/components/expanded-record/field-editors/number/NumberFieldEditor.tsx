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
			className={`w-full text-sm font-[Inter,sans-serif] py-2 px-3 rounded-md ${readonly ? "bg-[#f5f5f5]" : "bg-white"}`}
		/>
	);
};
