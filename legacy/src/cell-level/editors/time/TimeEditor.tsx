/**
 * Time Cell Editor Component
 *
 * PATTERN REFERENCE: This editor follows the same pattern as StringEditor and McqEditor
 */
import React, { useEffect, useRef, useCallback } from "react";
// @ts-ignore - react-input-mask types may not be available
import InputMask from "react-input-mask";
import ODSIcon from "@/lib/oute-icon";
import type { ITimeCell } from "@/types";
import { useTimeEditor } from "./hooks/useTimeEditor";
import { MERIDIEM_OPTIONS } from "./constants";

interface TimeEditorProps {
	cell: ITimeCell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: ITimeCell["data"]) => void;
	onSave?: () => void;
	onCancel?: () => void;
	onEnterKey?: (shiftKey: boolean) => void;
}

const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

export const TimeEditor: React.FC<TimeEditorProps> = ({
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
	const popperRef = useRef<HTMLDivElement>(null);

	const isTwentyFourHour = cell?.options?.isTwentyFourHour ?? false;
	const initialValue = cell;

	const {
		timeValue,
		setTimeValue,
		handleSave,
		resetToInitial,
		inputMaskRef,
		openDropdown,
		setOpenDropdown,
		triggerRef,
		iconName,
		handleInputFocus,
	} = useTimeEditor({
		initialValue,
		onChange: (value) => {
			onChange(value);
		},
		isTwentyFourHour,
	});

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !openDropdown) {
				e.preventDefault();
				e.stopPropagation();
				handleSave();
				onSave?.();
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(e.shiftKey);
					});
				}
			} else if (e.key === "Tab") {
				e.preventDefault();
				e.stopPropagation();
				handleSave();
				onSave?.();
			} else if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				resetToInitial();
				onCancel?.();
			}
		},
		[
			openDropdown,
			handleSave,
			resetToInitial,
			onSave,
			onCancel,
			onEnterKey,
		],
	);

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			if (openDropdown) {
				return;
			}

			const activeElement = document.activeElement;
			const popperElement = containerRef.current?.querySelector(
				"[data-time-meridiem-popper]",
			);

			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement) ||
					popperElement?.contains(activeElement))
			) {
				return;
			}

			handleSave();
			onSave?.();
		}, 0);
	}, [handleSave, onSave, openDropdown]);

	useEffect(() => {
		if (!openDropdown && inputMaskRef.current) {
			inputMaskRef.current.focus();
		}
	}, [openDropdown]);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
	}, []);

	const editorStyle: React.CSSProperties = {
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
		boxSizing: "border-box",
		pointerEvents: "auto",
	};

	return (
		<div
			ref={containerRef}
			className="relative box-border outline-none flex flex-col h-full font-[var(--tt-font-family)] text-[length:var(--cell-font-size)] min-w-[16px]"
			style={editorStyle}
			tabIndex={-1}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			data-testid="time-editor"
		>
			<div className="flex w-full h-[30px] items-center">
				<InputMask
					autoFocus={!openDropdown}
					placeholder="HH:MM"
					mask="99:99"
					maskChar={null}
					value={timeValue?.time || ""}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setTimeValue((prev) => ({
							...prev,
							time: e.target.value,
						}));
					}}
					onFocus={handleInputFocus}
				>
					{(inputProps: any) => (
						<input
							{...inputProps}
							ref={inputMaskRef}
							className="w-full border-none outline-none bg-transparent text-[length:var(--cell-font-size)] font-[var(--tt-font-family)] text-[var(--cell-text-primary-color)] pl-[8.8px]"
							placeholder="HH:MM"
							data-testid="editor-time-input"
						/>
					)}
				</InputMask>

				{!isTwentyFourHour && (
					<div className="flex items-center">
						<span className="w-px h-5 bg-[#cfd8dc] self-center mr-1.5" />

						<div
							className="flex cursor-pointer items-center py-2 pl-2 pr-1 text-[length:var(--cell-font-size)] text-[var(--cell-text-primary-color)] tracking-[0.25px] min-w-[38px]"
							ref={triggerRef}
							role="presentation"
							onMouseDown={(e) => {
								e.stopPropagation();
								setOpenDropdown((prev) => !prev);
							}}
							onClick={(e) => {
								e.stopPropagation();
							}}
							data-testid="set-meridiem"
						>
							<div className="min-w-[21px]">
								{timeValue?.meridiem || ""}
							</div>
							<ODSIcon
								outeIconName={iconName}
								outeIconProps={{
									sx: {
										width: "1rem",
										height: "1rem",
										color: "#000",
										marginLeft: "0.25rem",
									},
								}}
							/>
						</div>
					</div>
				)}
			</div>

			{!isTwentyFourHour && openDropdown && (
				<div
					ref={popperRef}
					className="absolute top-full right-[5px] mt-1 z-[1001] p-2 rounded-md border border-[#cfd8dc] bg-white shadow-md"
					data-time-meridiem-popper
					onClick={(e) => e.stopPropagation()}
					onMouseDown={(e) => {
						e.stopPropagation();
					}}
				>
					{MERIDIEM_OPTIONS.map((option) => (
						<div
							key={option}
							className="cursor-pointer p-1 text-[var(--cell-text-primary-color)] rounded-md select-none hover:bg-[#eceff1]"
							onMouseDown={(e) => {
								e.stopPropagation();
							}}
							onClick={(e) => {
								e.stopPropagation();
								setTimeValue((prev) => ({
									...prev,
									meridiem: option,
								}));
								setOpenDropdown(false);
								containerRef.current?.focus();
							}}
							role="presentation"
						>
							{option}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
