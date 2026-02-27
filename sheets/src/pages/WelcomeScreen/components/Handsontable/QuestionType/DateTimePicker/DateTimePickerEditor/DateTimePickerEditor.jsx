import React, { forwardRef } from "react";

import DateTimePicker from "../../../../../../../components/DateTimePicker";
import useDateTimeEditor from "../hooks/useDateTimeEditor";

import styles from "./styles.module.scss";

function DateTimePickerEditor(props, ref) {
	const {
		initialValue,
		onChange,
		cellProperties,
		setIsPopperOpen,
		superClose,
	} = props;

	const { fieldInfo = {} } = cellProperties?.cellProperties || {};

	const {
		dateFormat = "DDMMYYYY",
		separator = "/",
		includeTime = false,
	} = fieldInfo?.options || {};

	const {
		dateTimeVal,
		onChangeHandler,
		onKeyDownHandler,
		setPopperState,
		dateTimeInputRef,
	} = useDateTimeEditor({
		initialValue,
		onChange,
		superClose,
		setIsPopperOpen,
	});

	return (
		<div
			onKeyDown={onKeyDownHandler}
			className={styles.date_time_container}
			ref={ref}
			data-testid="date-time-picker-editor"
		>
			<DateTimePicker
				value={dateTimeVal}
				dateFormat={dateFormat}
				separator={separator}
				includeTime={includeTime}
				onChange={onChangeHandler}
				onSubmit={onChangeHandler}
				onPopperChange={setPopperState}
				inputRef={dateTimeInputRef}
				hideBorders={true}
				disablePortal={true}
				sx={{
					".MuiInputBase-root": {
						borderRadius: "0.25rem",
					},
					".MuiInputBase-input": {
						padding: "0.31rem 0.45rem",
					},
				}}
			/>
		</div>
	);
}

export default forwardRef(DateTimePickerEditor);
