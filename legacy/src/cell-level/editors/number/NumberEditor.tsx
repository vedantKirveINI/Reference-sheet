// Cell editor for number type
import React, { useState, useEffect, useRef } from "react";

interface NumberEditorProps {
	cell: any;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: number | null) => void;
	onSave?: () => void;
	onCancel?: () => void;
}

export const NumberEditor: React.FC<NumberEditorProps> = ({
	cell,
	rect,
	theme,
	isEditing,
	onChange,
	onSave,
	onCancel,
}) => {
	// Use string state for input display (allows empty string)
	// Convert to number only when saving
	const [inputValue, setInputValue] = useState<string>(
		cell?.data !== null && cell?.data !== undefined
			? String(cell.data)
			: "",
	);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (inputRef.current && isEditing) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Keep the raw input value as string (allows empty)
		setInputValue(e.target.value);
		// Don't call onChange on every keystroke - it causes full page re-renders
		// onChange will be called on save instead
	};

	const getNumericValue = (): number | null => {
		// If input is empty or just whitespace, return null
		if (!inputValue || inputValue.trim() === "") {
			return null;
		}

		// Try to parse as number
		const parsed = parseFloat(inputValue);
		// Return null if NaN, otherwise return the number
		return isNaN(parsed) ? null : parsed;
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			// Save the value (null if empty, number if valid)
			const numericValue = getNumericValue();
			onChange(numericValue);
			// Keyboard hook will handle navigation to next cell
		} else if (e.key === "Escape") {
			e.preventDefault();
			onCancel?.();
		}
	};

	const handleBlur = () => {
		// Save the value (null if empty, number if valid)
		const numericValue = getNumericValue();
		onChange(numericValue);
		onSave?.();
	};

	return (
		<div
			style={{
				position: "absolute",
				left: rect.x,
				top: rect.y,
				width: rect.width,
				height: rect.height,
				zIndex: 1000,
			}}
		>
			<input
				ref={inputRef}
				type="text"
				inputMode="decimal"
				value={inputValue}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				style={{
					width: `${rect.width + 4}px`, // Add 4px for 2px border on each side
					height: `${rect.height + 4}px`, // Add 4px for 2px border on top/bottom
					marginLeft: -2, // Offset by border width to align with cell
					marginTop: -2, // Offset by border width to align with cell
					boxSizing: "border-box",
					padding: "2px 8px",
					border: `2px solid ${theme.cellActiveBorderColor}`,
					backgroundColor: theme.cellBackgroundColor,
					borderRadius: 2,
					fontSize: theme.fontSize,
					fontFamily: theme.fontFamily,
					outline: "2px solid transparent",
					outlineOffset: "2px",
					textAlign: "right",
				}}
			/>
		</div>
	);
};
