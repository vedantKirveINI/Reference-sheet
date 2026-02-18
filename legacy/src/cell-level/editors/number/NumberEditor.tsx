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
		setInputValue(e.target.value);
	};

	const getNumericValue = (): number | null => {
		if (!inputValue || inputValue.trim() === "") {
			return null;
		}

		const parsed = parseFloat(inputValue);
		return isNaN(parsed) ? null : parsed;
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			const numericValue = getNumericValue();
			onChange(numericValue);
		} else if (e.key === "Escape") {
			e.preventDefault();
			onCancel?.();
		}
	};

	const handleBlur = () => {
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
					width: `${rect.width + 4}px`,
					height: `${rect.height + 4}px`,
					marginLeft: -2,
					marginTop: -2,
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
