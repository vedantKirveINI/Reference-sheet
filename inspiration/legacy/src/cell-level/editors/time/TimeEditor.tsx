/**
 * Time Cell Editor Component
 *
 * PATTERN REFERENCE: This editor follows the same pattern as StringEditor and McqEditor
 * Use this as a reference when creating new cell editors.
 *
 * KEY PATTERNS:
 * 1. SAVING LOGIC: onChange is called ONLY on save events (Enter/Tab/blur), NOT on every change
 *    - Local state updates immediately for UI feedback
 *    - Parent onChange is called only when saving
 *    - This prevents full page re-renders during editing
 *
 * 2. POSITIONING: Matches StringEditor's border alignment
 *    - width: rect.width + 4 (2px border on each side)
 *    - height: rect.height + 4 (2px border on top/bottom)
 *    - marginLeft/Top: -2 (aligns border with cell)
 *
 * 3. KEYBOARD HANDLING:
 *    - Enter: Save and navigate to next cell
 *    - Tab: Save and navigate
 *    - Escape: Cancel editing
 *
 * 4. BLUR HANDLING: Save on blur (focus out), but check if focus is moving within editor
 *
 * 5. EVENT PROPAGATION: Stop propagation to prevent canvas scrolling/interaction
 */
import React, { useEffect, useRef, useCallback } from "react";
// @ts-ignore - react-input-mask types may not be available
import InputMask from "react-input-mask";
import ODSIcon from "oute-ds-icon";
import type { ITimeCell } from "@/types";
import { useTimeEditor } from "./hooks/useTimeEditor";
import { MERIDIEM_OPTIONS } from "./constants";
import styles from "./TimeEditor.module.css";

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

	/**
	 * PATTERN: Local state management hook
	 * - Updates local state immediately for UI feedback
	 * - Does NOT call onChange (that's handled on save events)
	 * - Matches StringEditor pattern exactly
	 */
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

	/**
	 * PATTERN: Keyboard event handler (matches StringEditor pattern)
	 * - Enter: Save value and navigate to next cell
	 * - Tab: Save value and navigate
	 * - Escape: Cancel editing (discard changes)
	 *
	 * NOTE: onChange is called here (on save), NOT on every time change
	 * This matches StringEditor's pattern of calling onChange only on save events
	 */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Don't handle Enter if dropdown is open (let user select AM/PM)
			if (e.key === "Enter" && !openDropdown) {
				e.preventDefault();
				e.stopPropagation();
				// PATTERN: Save value before closing (matches StringEditor)
				handleSave();
				onSave?.();
				// Trigger navigation if onEnterKey is provided
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(e.shiftKey);
					});
				}
			} else if (e.key === "Tab") {
				e.preventDefault();
				e.stopPropagation();
				// PATTERN: Save value before closing (matches StringEditor)
				handleSave();
				onSave?.();
				// Tab navigation would be handled by keyboard hook
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

	/**
	 * PATTERN: Blur event handler (matches StringEditor pattern)
	 * - Checks if focus is moving within editor (don't close if it is)
	 * - Saves value when focus moves outside editor
	 * - Uses setTimeout to check focus after event propagation (like StringEditor)
	 */
	const handleBlur = useCallback(() => {
		// PATTERN: Use setTimeout to check focus after event propagation
		// This prevents blur when clicking inside editor or scrolling (matches StringEditor)
		setTimeout(() => {
			// If popper is open, don't close the editor
			if (openDropdown) {
				return;
			}

			const activeElement = document.activeElement;

			// Check for popper element using data attribute (like SCQ editor - search within container)
			const popperElement = containerRef.current?.querySelector(
				"[data-time-meridiem-popper]",
			);

			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement) ||
					popperElement?.contains(activeElement))
			) {
				// Focus is still within editor or popper, don't close
				return;
			}

			// Focus moved outside editor, save and close
			handleSave();
			onSave?.();
		}, 0);
	}, [handleSave, onSave, openDropdown]);

	// Focus input when dropdown closes
	useEffect(() => {
		if (!openDropdown && inputMaskRef.current) {
			inputMaskRef.current.focus();
		}
	}, [openDropdown]);

	// Stop event propagation to prevent canvas scrolling/interaction
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent event bubbling to grid (like MCQ editor)
		// Don't preventDefault - allow normal interactions within editor
	}, []);

	const editorStyle: React.CSSProperties = {
		position: "absolute",
		left: `${rect.x}px`,
		top: `${rect.y}px`,
		width: `${rect.width + 4}px`, // Add 4px for 2px border on each side (like StringEditor)
		height: `${rect.height + 4}px`, // Add 4px for 2px border on top/bottom (like StringEditor)
		marginLeft: -2, // Offset by border width to align with cell (like StringEditor)
		marginTop: -2, // Offset by border width to align with cell (like StringEditor)
		zIndex: 1000,
		backgroundColor: theme.cellBackgroundColor,
		border: `2px solid ${theme.cellActiveBorderColor}`,
		borderRadius: "2px",
		boxSizing: "border-box",
		pointerEvents: "auto", // Allow interaction with editor (like StringEditor/MCQ)
	};

	return (
		<div
			ref={containerRef}
			className={styles.time_container}
			style={editorStyle}
			tabIndex={-1}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			data-testid="time-editor"
		>
			<div className={styles.input_mask}>
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
							className={styles.custom_input}
							placeholder="HH:MM"
							data-testid="editor-time-input"
						/>
					)}
				</InputMask>

				{!isTwentyFourHour && (
					<div className={styles.meridiem_container}>
						<span className={styles.vertical_line} />

						<div
							className={styles.meridiem_content}
							ref={triggerRef}
							role="presentation"
							onMouseDown={(e) => {
								// Prevent event bubbling to grid (like MCQ editor)
								e.stopPropagation();
								// Set state in onMouseDown so it's updated before blur fires
								setOpenDropdown((prev) => !prev);
							}}
							onClick={(e) => {
								e.stopPropagation();
							}}
							data-testid="set-meridiem"
						>
							<div className={styles.meridiem}>
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
					className={styles.popper_container}
					data-time-meridiem-popper
					style={{
						position: "absolute",
						top: "100%",
						right: 5,
						marginTop: "4px",
						zIndex: 1001,
					}}
					onClick={(e) => e.stopPropagation()}
					onMouseDown={(e) => {
						e.stopPropagation();
					}}
				>
					{MERIDIEM_OPTIONS.map((option) => (
						<div
							key={option}
							className={styles.meridiem_option}
							style={{ cursor: "pointer" }}
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
								// Refocus container after selection (like SCQ editor)
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
