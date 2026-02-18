import React, { useRef, useCallback } from "react";
import DateTimePicker from "@/components/DateTimePicker";
import type { IDateTimeCell } from "@/types";
import { useDateTimeEditor } from "./hooks/useDateTimeEditor";
import styles from "./DateTimeEditor.module.css";

interface DateTimeEditorProps {
	cell: IDateTimeCell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: string | null) => void;
	onSave?: () => void;
	onCancel?: () => void;
	onEnterKey?: (shiftKey: boolean) => void;
}

const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

export const DateTimeEditor: React.FC<DateTimeEditorProps> = ({
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

	const initialValue = cell;
	const options = cell?.options || {};
	const {
		dateFormat = "DDMMYYYY",
		separator = "/",
		includeTime = false,
		isTwentyFourHourFormat = false,
	} = options;

	const {
		dateTimeVal,
		onChangeHandler,
		handleOkClick,
		handleSave,
		resetToInitial,
		dateTimeInputRef,
	} = useDateTimeEditor({
		initialValue,
		onChange: (value) => {
			onChange(value);
		},
	});

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
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
		[handleSave, resetToInitial, onSave, onCancel, onEnterKey],
	);

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			const activeElement = document.activeElement;

			// Check for popper element using data attribute (like MCQ editor)
			const popperElement = containerRef.current?.querySelector(
				"[data-time-meridiem-popper], [data-date-time-popover]",
			);

			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement) ||
					popperElement?.contains(activeElement))
			) {
				// Focus is still within editor or popper, don't save yet
				return;
			}

			// Focus moved outside editor - save the current value (triggers socket emission)
			handleSave();
			onSave?.();
		}, 0);
	}, [handleSave, onSave]);

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
		padding: `${PADDING_HEIGHT}px ${PADDING_WIDTH}px`,
		boxSizing: "border-box",
		pointerEvents: "auto",
		overflow: "visible",
	};

	return (
		<div
			ref={containerRef}
			className={styles.date_time_container}
			style={editorStyle}
			tabIndex={-1}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			data-testid="date-time-editor"
		>
			<DateTimePicker
				value={dateTimeVal}
				dateFormat={dateFormat}
				separator={separator}
				includeTime={includeTime}
				isTwentyFourHourFormat={isTwentyFourHourFormat}
				onChange={onChangeHandler}
				onSubmit={handleOkClick}
				inputRef={dateTimeInputRef}
				hideBorders={true}
				disablePortal={true}
				inputFocus={true}
				sx={{
					".MuiInputBase-root": {
						borderRadius: "0.25rem",
					},
					".MuiInputBase-input": {
						padding: "0.31rem 0.45rem",
						fontSize: theme.fontSize,
						fontFamily: theme.fontFamily,
					},
					"MuiPickersInputBase-root":{
						padding: "0rem !important"
					},
					"& .MuiPickersSectionList-root": {
						padding: "0rem !important"
					}
				}}
			/>
		</div>
	);
};
