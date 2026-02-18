import React, { useCallback, useEffect, useMemo, useRef } from "react";
import type { IOpinionScaleCell } from "@/types";
import { useOpinionScaleEditor } from "./hooks/useOpinionScaleEditor";
import { OptionList } from "./components/OptionList";

interface OpinionScaleEditorProps {
	cell: IOpinionScaleCell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: number | null) => void;
	onSave?: () => void;
	onCancel?: () => void;
	onEnterKey?: (shiftKey: boolean) => void;
}

export const OpinionScaleEditor: React.FC<OpinionScaleEditorProps> = ({
	cell,
	rect,
	theme,
	isEditing,
	onChange,
	onSave,
	onCancel,
	onEnterKey,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const maxValue = cell?.options?.maxValue ?? 10;
	const initialValue = useMemo(() => {
		return cell?.data ?? null;
	}, [cell]);

	const options = useMemo(() => {
		return Array.from({ length: maxValue }, (_, i) => i + 1);
	}, [maxValue]);

	const {
		selectedValue,
		handleSelectOption,
		popperOpen,
		setPopperOpen,
		hasUserEdited,
	} = useOpinionScaleEditor({
		initialValue,
		maxValue,
		options,
		containerWidth: rect.width,
		containerHeight: rect.height,
	});

	useEffect(() => {
		if (isEditing) {
			setPopperOpen(true);
			containerRef.current?.focus();
		}
	}, [isEditing, setPopperOpen]);

	const commitValue = useCallback(() => {
		if (hasUserEdited) {
			onChange(selectedValue);
		}
		onSave?.();
	}, [onChange, onSave, selectedValue, hasUserEdited]);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === "Enter" && !event.shiftKey) {
				if (popperOpen) {
					return;
				}
				event.preventDefault();
				event.stopPropagation();
				commitValue();
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(event.shiftKey);
					});
				}
			} else if (event.key === "Tab") {
				event.preventDefault();
				event.stopPropagation();
				commitValue();
			} else if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				setPopperOpen(false);
				onCancel?.();
			}
		},
		[commitValue, onCancel, onEnterKey, popperOpen, setPopperOpen],
	);

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			const activeElement = document.activeElement;
			const optionList = containerRef.current?.querySelector(
				"[data-opinion-scale-option-list]",
			);

			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement) ||
					optionList?.contains(activeElement))
			) {
				return;
			}
			commitValue();
		}, 0);
	}, [commitValue]);

	const handleMouseDown = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
	}, []);

	const displayValue =
		selectedValue !== null && selectedValue !== undefined
			? `${selectedValue}/${maxValue}`
			: "";

	return (
		<div
			ref={containerRef}
			className="box-border outline-none flex flex-col h-full"
			style={{
				position: "absolute",
				left: `${rect.x}px`,
				top: `${rect.y}px`,
				width: `${rect.width + 4}px`,
				height: `${rect.height + 4}px`,
				marginLeft: -2,
				marginTop: -2,
				zIndex: 1000,
				backgroundColor: theme.cellBackgroundColor,
				border: `2px solid ${theme.cellActiveBorderColor}`,
				borderRadius: "2px",
				padding: "4px 8px",
				boxSizing: "border-box",
				pointerEvents: "auto",
			}}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			tabIndex={-1}
			data-testid="opinion-scale-editor"
		>
			<div className="flex items-start w-full min-h-0 flex-1">
				<div
					className="w-full p-0 border-none outline-none bg-transparent cursor-pointer select-none flex items-start min-h-[20px]"
					onClick={() => setPopperOpen((prev) => !prev)}
					style={{
						fontSize: theme.fontSize || 14,
						fontFamily: theme.fontFamily || "Arial",
						color: displayValue
							? theme.cellTextColor || "#212121"
							: theme.cellPlaceholderColor || "#999",
					}}
				>
					{displayValue || "Select a value"}
				</div>
			</div>

			{popperOpen && (
				<div
					className="absolute top-[calc(100%+4px)] left-0 z-[1001] bg-white border border-[#e0e0e0] rounded shadow-md overflow-hidden"
					style={{
						width: `${rect.width}px`,
					}}
				>
					<OptionList
						options={options}
						selectedValue={selectedValue}
						onSelectOption={(value) => {
							handleSelectOption(value);
							setPopperOpen(false);
							containerRef.current?.focus();
						}}
					/>
				</div>
			)}
		</div>
	);
};

OpinionScaleEditor.displayName = "OpinionScaleEditor";
